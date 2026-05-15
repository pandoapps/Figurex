<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Validation\ValidationException;

class SettingService
{
    private const GROUPS = ['asaas', 'fretenet'];

    public function get(string $group): array
    {
        $this->assertValidGroup($group);

        return Setting::group($group);
    }

    public function update(string $group, array $values): array
    {
        $this->assertValidGroup($group);

        Setting::persistGroup($group, $values);

        return Setting::group($group);
    }

    private function assertValidGroup(string $group): void
    {
        if (! in_array($group, self::GROUPS, true)) {
            throw ValidationException::withMessages([
                'group' => ['Grupo de configuração inválido.'],
            ]);
        }
    }
}
