// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

// Función para registrar un nuevo usuario con email, contraseña y rol
const registerUser = async (req, res, db) => {
    try {
      const { email, password, role, name } = req.body;
  
      // Comprobamos si el email ya está registrado
      const [existingUser] = await db.promise().execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
  
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }
  
      // Ciframos la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Guardamos el usuario en la base de datos
      await db.promise().execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
  
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  };

  const loginUser = async (req, res, db) => {
    try {
      const { email, password } = req.body;
  
      // Buscamos el usuario en la base de datos
      const [users] = await db.promise().execute('SELECT * FROM users WHERE email = ?', [
        email
      ]);
      const user = users[0];
  
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
  
      // Comparamos la contraseña cifrada con la ingresada por el usuario
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
  
      // Generamos el token JWT con el role numérico
      const token = jwt.sign({ email, id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  
      res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  };
  
  module.exports = { registerUser, loginUser };
  