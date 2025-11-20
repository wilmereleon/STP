// Actualizar contraseña del usuario admin
db.users.updateOne(
  { email: 'admin@teleprompter.com' },
  { $set: { password: '$2a$10$.NUbc8F9fO4r1P85WfZRlO.znz2RsnmIu9s8MP90Rw48oxBc6ey2i' } }
);

// Verificar el cambio
const user = db.users.findOne({ email: 'admin@teleprompter.com' }, { email: 1, password: 1, role: 1 });
print('\n✅ Usuario actualizado:');
print('Email:', user.email);
print('Role:', user.role);
print('Password hash:', user.password);
