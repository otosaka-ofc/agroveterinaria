<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear rol de administrador si no existe
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        
        // Crear permisos básicos
        $permissions = [
            'manage users',
            'manage products',
            'manage categories',
            'manage sales',
            'manage inventory',
        ];
        
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
        
        // Asignar todos los permisos al rol admin
        $adminRole->syncPermissions(Permission::all());

        $developer = User::firstOrCreate(
            ['email' => 'dev@admin.com'],
            [
                'name' => 'developer',
                'password' => Hash::make('password')
            ]
        );
        
        // Crear usuario administrador
        $admin = User::firstOrCreate(
            ['email' => 'admin@agroveterinaria.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
            ]
        );
        
        // Asignar rol de administrador
        $admin->assignRole('admin');
        $developer->assignRole('admin');
        
        $this->command->info('Usuario administrador creado exitosamente!');
        $this->command->info('Email: admin@agroveterinaria.com');
        $this->command->info('Password: password');
    }
}
