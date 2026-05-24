<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Primero crear roles y permisos
       $this->call(RolePermissionSeeder::class);

        // Crear usuario administrador
       // $admin = User::firstOrCreate(
         //  ['email' => 'admin@agroveterinaria.com'],
          //  [
           //     'name' => 'Administrador',
           //     'password' => 'password',
            //    'email_verified_at' => now(),
          //  ]
     //   );
        //$admin->assignRole('Administrador');

        $developer = User::firstOrCreate(
            ['email' => 'dev@admin.com'],
            [
                'name' => 'developer',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $developer->assignRole('Administrador');

        // Crear usuario vendedor de prueba
       // $vendedor = User::firstOrCreate(
           // ['email' => 'vendedor@agroveterinaria.com'],
           // [
            //    'name' => 'Juan Vendedor',
           //     'password' => 'password',
            //    'email_verified_at' => now(),
           // ]
       // );
        //$vendedor->assignRole('Vendedor');

        // Crear usuario almacenero de prueba
        //$almacenero = User::firstOrCreate(
           // ['email' => 'almacenero@agroveterinaria.com'],
           // [
           //     'name' => 'Pedro Almacenero',
           //    'password' => 'password',
            //    'email_verified_at' => now(),
          //  ]
       // );
       // $almacenero->assignRole('Almacenero');

        // Crear datos de prueba
        $this->call(TestDataSeeder::class);
    }
}
