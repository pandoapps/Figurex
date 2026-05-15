<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class FreteNetService
{
    // Mínimos aceitos pela Frenet/Correios para PAC, SEDEX e Mini Envios.
    // Não reduza estes valores — são os limites inferiores documentados pela API.
    private const WEIGHT = 0.3;  // kg  (mínimo Correios: 300 g)
    private const WIDTH  = 11;   // cm  (mínimo Correios: 11 cm)
    private const HEIGHT = 2;    // cm  (mínimo Correios: 2 cm)
    private const LENGTH = 16;   // cm  (mínimo Correios: 16 cm)

    private const FALLBACK_COST = 12.90;
    private const API_URL = 'http://api.frenet.com.br/shipping/quote';

    public function isConfigured(): bool
    {
        $settings = Setting::group('fretenet');

        return ! empty($settings['token']);
    }

    /**
     * Retorna as opções de frete disponíveis.
     * Usa o CEP do vendedor como origem; se vazio, cai para o CEP global das configurações.
     *
     * @return array<int, array{service: string, price: float, delivery_days: int|null, fallback: bool}>
     */
    public function quote(string $sellerCep, string $destinationCep): array
    {
        $settings = Setting::group('fretenet');

        $token = $settings['token'] ?? null;
        $defaultService = $settings['default_shipping_type'] ?? 'PAC';

        $effectiveOrigin = ! empty($sellerCep) ? $sellerCep : ($settings['origin_cep'] ?? null);

        if (! $token || ! $effectiveOrigin) {
            return $this->fallbackOptions($defaultService);
        }

        $origin = preg_replace('/\D/', '', $effectiveOrigin);
        $destination = preg_replace('/\D/', '', $destinationCep);

        try {
            $response = Http::withHeaders(['token' => $token])
                ->acceptJson()
                ->timeout(10)
                ->post(self::API_URL, [
                    'SellerCEP'            => $origin,
                    'RecipientCEP'         => $destination,
                    'ShipmentInvoiceValue' => 10.00,
                    'RecipientCountry'     => 'BR',
                    'ShippingItemArray'    => [[
                        'Weight'    => self::WEIGHT,
                        'Length'    => self::LENGTH,
                        'Height'    => self::HEIGHT,
                        'Width'     => self::WIDTH,
                        'Diameter'  => 0,
                        'SKU'       => 'figurinha',
                        'Category'  => 'Colecionáveis',
                        'isFragile' => false,
                        'Quantity'  => 1,
                    ]],
                ]);

            if (! $response->successful()) {
                return $this->fallbackOptions($defaultService);
            }

            $services = $response->json('ShippingSevicesArray') ?? [];

            $options = [];
            foreach ($services as $item) {
                // Frenet sinaliza erro com Error=true ou ShippingPrice zerado
                if (! empty($item['Error']) || ($item['ShippingPrice'] ?? 0) <= 0) {
                    continue;
                }
                $options[] = [
                    'service'      => $item['ServiceDescription'],
                    'price'        => (float) $item['ShippingPrice'],
                    'delivery_days' => isset($item['DeliveryTime']) ? (int) $item['DeliveryTime'] : null,
                    'fallback'     => false,
                ];
            }

            return ! empty($options) ? $options : $this->fallbackOptions($defaultService);
        } catch (\Throwable) {
            return $this->fallbackOptions($defaultService);
        }
    }

    /**
     * Retorna o preço autoritativo para o serviço escolhido, reconsultando a API.
     * Usado no checkout para garantir que o preço não foi manipulado pelo cliente.
     */
    public function getPriceForService(string $sellerCep, string $destinationCep, string $service): float
    {
        $options = $this->quote($sellerCep, $destinationCep);

        foreach ($options as $option) {
            if ($option['service'] === $service) {
                return $option['price'];
            }
        }

        // Serviço não encontrado: usa primeira opção disponível
        return ! empty($options) ? $options[0]['price'] : self::FALLBACK_COST;
    }

    /** @return array<int, array{service: string, price: float, delivery_days: int, fallback: bool}> */
    private function fallbackOptions(string $defaultService): array
    {
        return [[
            'service' => $defaultService,
            'price' => self::FALLBACK_COST,
            'delivery_days' => 7,
            'fallback' => true,
        ]];
    }
}
