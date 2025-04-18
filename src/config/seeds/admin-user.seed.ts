import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/core/users/entities/user.entity';
import { Role } from '@/common/enum/role';

export const runAdminUserSeed = async (
  dataSource: DataSource,
): Promise<void> => {
  // Obtener el repositorio de usuarios
  const userRepository = dataSource.getRepository(User);

  // Verificar si los usuarios ya existen
  const existingHector = await userRepository.findOne({
    where: { email: 'hector@example.com' },
  });

  // Crear el usuario administrador si no existe
  if (!existingHector) {
    const hashedPassword = await bcrypt.hash('password', 10);

    const hectorAdmin = userRepository.create({
      name: 'Hector',
      email: 'hector@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    });

    await userRepository.save(hectorAdmin);
    console.log('Usuario administrador Hector creado exitosamente');
  } else {
    console.log('El usuario administrador Hector ya existe');
  }
};
