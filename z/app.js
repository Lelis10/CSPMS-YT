// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const { registerUser, loginUser } = require('./controllers/authController');
const auth = require("./middleware/auth");
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

dotenv.config();

// Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});

// Rutas para el registro de usuario y el inicio de sesión
app.post('/register', (req, res) => registerUser(req, res, db));
app.post('/login', (req, res) => loginUser(req, res, db));

// Ruta protegida con JWT para obtener los datos del usuario autenticado
app.get('/profile', auth, (req, res) => {
  // Obtener el usuario autenticado desde el token
  const { email } = req.user;
  const { role } = req.user;

  // Realizar la consulta para obtener los datos del usuario desde la tabla users
  const sqlQuery = `
    SELECT *
    FROM users
    WHERE email = ?`; 

  db.query(sqlQuery, [email, role], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del usuario: ', error);
      return res.status(500).json({ error: 'Error al obtener los datos del usuario' });
    }
    // Enviar los datos del usuario como respuesta
    res.json(results[0]);
  });
});


app.get('/user_role', auth, (req, res) => {
  // Obtener el usuario autenticado desde el token
  const { role } = req.user;
  res.json(role);
  // Realizar la consulta para obtener los datos del usuario desde la tabla users

});


// Agregar la nueva ruta protegida para obtener los proyectos del usuario con información del usuario y coordinador asociados
app.get('/projects', auth, (req, res) => {
  // Obtener el usuario autenticado desde el token
  const { email } = req.user;

  // Realizar la consulta para obtener los proyectos relacionados con el usuario y la información del usuario y coordinador
  const sqlQuery = `
  SELECT p.id AS proyecto_id, p.nombre_proyecto, p.escuela, p.estado, u.name AS nombre_usuario,
  c.name AS nombre_director, c.email AS email_director
FROM proyectos p
INNER JOIN user_proyecto up ON p.id = up.proyecto_id
INNER JOIN users u ON up.user_id = u.id
LEFT JOIN users c ON up.director_id = c.id
WHERE u.email = ?;` 

  db.query(sqlQuery, [email], (error, results) => {
    if (error) {
      console.error('Error al obtener los proyectos del usuario: ', error);
      return res.status(500).json({ error: 'Error al obtener los proyectos del usuario' });
    }
    // Enviar los proyectos obtenidos con información del usuario y coordinador como respuesta
    res.json(results);
  });
});

// ruta para conseguir todos los proyectos registrados
app.get('/all-projects', auth, (req, res) => {
  const sqlQuery = `
  SELECT * from proyectos;
  `;

  db.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener los proyectos: ', error);
      return res.status(500).json({ error: 'Error al obtener los proyectos' });
    }

    res.json(results);
  });
});


app.get('/all-requests', auth, (req, res) => {
  // Obtener el usuario autenticado desde el token
  const { id } = req.user;

  // Realizar la consulta para obtener los proyectos relacionados con el usuario y la información del usuario y coordinador
  const sqlQuery = `
  SELECT s.user_id, s.proyecto_id, e.nombre, e.apellido, p.nombre_proyecto
  FROM Estudiantes as e
  JOIN solicitud as s ON e.id = s.user_id
  JOIN proyectos p ON s.proyecto_id = p.id
  where p.director_id = ? and s.estado = 'pendiente';`; 

  db.query(sqlQuery, [id], (error, results) => {
    if (error) {
      console.error('Error al obtener los proyectos del usuario: ', error);
      return res.status(500).json({ error: 'Error al obtener los proyectos del usuario' });
    }
    // Enviar los proyectos obtenidos con información del usuario y coordinador como respuesta
    res.json(results);
  });
});


app.get('/all-proposals', auth, (req, res) => {
  // Obtener el usuario autenticado desde el token

  // Realizar la consulta para obtener los proyectos relacionados con el usuario y la información del usuario y coordinador
  const sqlQuery = `
  SELECT * from proyectos
  where estado = 'pendiente';
  `; 

  db.query(sqlQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener los proyectos del usuario: ', error);
      return res.status(500).json({ error: 'Error al obtener los proyectos del usuario' });
    }
    // Enviar los proyectos obtenidos con información del usuario y coordinador como respuesta
    res.json(results);
  });
});


// Ruta para la creación de proyectos
app.post('/create-project', auth, (req, res) => createProject(req, res, db));


// Ruta para guardar la solicitud
app.post('/guardar-solicitud', auth, (req, res) => {
  const { nombres, apellidos, cedula, escuela, semestre, telefono, proyecto_id, FormatoV2, estado } = req.body;

  // Aquí puedes obtener el user_id a partir del token de autenticación
  const { id } = req.user; // Asumiendo que el user_id está disponible en req.user.id
  // Aquí puedes realizar la validación de los datos recibidos antes de guardar la solicitud en la base de datos
  // ...
  // Verificar si ya existe una solicitud para este usuario y proyecto
  const sqlQueryVerificarSolicitud = `
    SELECT COUNT(*) AS count FROM solicitud WHERE user_id = ? AND proyecto_id = ?
  `;

  db.query(sqlQueryVerificarSolicitud, [id, proyecto_id], (error, result) => {
    if (error) {
      console.error('Error al verificar la solicitud: ', error);
      return res.status(500).json({ error: 'Error al verificar la solicitud' });
    }

    const count = result[0].count;

    if (count > 0) {
      // El usuario ya ha enviado una solicitud para unirse a este proyecto
      return res.status(400).json({ error: 'Ya has enviado una solicitud para unirte a este proyecto' });
    }

    // Primero, realizamos la consulta para insertar la solicitud en la tabla "solicitud"
    const sqlQuerySolicitud = `
      INSERT INTO solicitud (user_id, proyecto_id, estado, FormatoV2)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlQuerySolicitud, [id, proyecto_id, estado, FormatoV2], (error, result) => {
      if (error) {
        console.error('Error al guardar la solicitud: ', error);
        return res.status(500).json({ error: 'Error al guardar la solicitud' });
      }

      // Now, use INSERT ... ON DUPLICATE KEY UPDATE to insert or update the row in the Estudiantes table
      const sqlQueryEstudiante = `
        INSERT INTO Estudiantes (id, nombre, apellido, cedula, escuela, semestre, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        nombre = VALUES(nombre), 
        apellido = VALUES(apellido), 
        escuela = VALUES(escuela), 
        semestre = VALUES(semestre), 
        telefono = VALUES(telefono)
      `;

      db.query(
        sqlQueryEstudiante,
        [id, nombres, apellidos, cedula, escuela, semestre, telefono],
        (error, result) => {
          if (error) {
            console.error('Error al guardar los datos del estudiante: ', error);
            return res.status(500).json({ error: 'Error al guardar los datos del estudiante' });
          }

          return res.json({ message: 'Solicitud enviada exitosamente' });
        }
      );
    });
  });
});


app.post('/propuesta', auth,   (req, res) => {
  const { nombres, escuela, director, descripcion, FormatoV1, fechaCreacion, fechaFinalizacion } = req.body;
  // Aquí puedes obtener el user_id a partir del token de autenticación
  const { id } = req.user; // Asumiendo que el user_id está disponible en req.user.id
  // Aquí puedes realizar la validación de los datos recibidos antes de guardar la solicitud en la base de datos
  // ...

  // Realizar la inserción directamente con estado 'pendiente'
  const sqlQueryInsertarPropuesta = `
    INSERT INTO proyectos (estado, director_id, director, FormatoV1, nombre_proyecto, escuela, descripcion, fecha_creacion, fecha_finalizacion)
    VALUES ('pendiente', ?, ?, ?, ?, ?, ?, ?, ?) 
  `;

  db.query(
    sqlQueryInsertarPropuesta,
    [id, director, FormatoV1, nombres, escuela, descripcion, fechaCreacion, fechaFinalizacion],
    (error, result) => {
      if (error) {
        console.error('Error al insertar la propuesta: ', error);
        return res.status(500).json({ error: 'Error al insertar la propuesta' });
      }

      return res.json({ message: 'Propuesta enviada exitosamente' });
    }
  );
});

  // Ruta para cambiar el estado de un proyecto a "aceptado"
  app.post('/aceptar-propuesta', auth, (req, res) => {
    const { projectId } = req.body;
    // Realizar la actualización del estado del proyecto en la base de datos
    const sqlQuery = `
      UPDATE proyectos
      SET estado = 'aceptado'
      WHERE id = ?;
    `;

    db.query(sqlQuery, [projectId], (error, result) => {
      if (error) {
        console.error('Error al cambiar el estado del proyecto: ', error);
        return res.status(500).json({ error: 'Error al cambiar el estado del proyecto' });
      }

      return res.json({ message: 'Estado del proyecto cambiado a aceptado' });
    });
  });

  app.post('/aceptar-solicitud', auth, (req, res) => {
    const { projectId, user_id } = req.body;
    console.log(projectId);
    const { id } = req.user;
  
    // Realizar la actualización del estado del proyecto en la tabla 'solicitud'
    const sqlQuery1 = `
      UPDATE solicitud
      SET estado = 'aceptado'
      WHERE user_id = ? and proyecto_id = ?;
    `;
  
    db.query(sqlQuery1, [user_id, projectId], (error, result) => {
      if (error) {
        console.error('Error al cambiar el estado del proyecto: ', error);
        return res.status(500).json({ error: 'Error al cambiar el estado del proyecto' });
      }
  
      // Realizar la actualización del estado en la tabla 'otra_tabla'
      const sqlQuery2 = `
        INSERT INTO user_proyecto (user_id, proyecto_id, director_id)
        VALUES (?, ?, ?)
      `;
  
      db.query(sqlQuery2, [user_id, projectId, id], (error, result) => {
        if (error) {
          console.error('Error al cambiar el estado en otra_tabla: ', error);
          return res.status(500).json({ error: 'Error al cambiar el estado en otra_tabla' });
        }
  
        return res.json({ message: 'Estado del proyecto y de otra_tabla cambiados a aceptado' });
      });
    });
  });
  

  // Ruta para eliminar un proyecto específico
  app.post('/rechazar-propuesta', auth, (req, res) => {
    const { projectId } = req.body;

    // Realizar la eliminación del proyecto en la base de datos
    const sqlQuery = `
      DELETE FROM proyectos
      WHERE id = ?;
    `;

    db.query(sqlQuery, [projectId], (error, result) => {
      if (error) {
        console.error('Error al eliminar el proyecto: ', error);
        return res.status(500).json({ error: 'Error al eliminar el proyecto' });
      }

      return res.json({ message: 'Proyecto eliminado correctamente' });
    });
  });

   // Ruta para eliminar un proyecto específico
   app.post('/rechazar-solicitud', auth, (req, res) => {
    const { projectId } = req.body;

    // Realizar la eliminación del proyecto en la base de datos
    const sqlQuery = `
      DELETE FROM solicitud
      WHERE proyecto_id = ?;
    `;

    db.query(sqlQuery, [projectId], (error, result) => {
      if (error) {
        console.error('Error al eliminar el proyecto: ', error);
        return res.status(500).json({ error: 'Error al eliminar el proyecto' });
      }

      return res.json({ message: 'Proyecto eliminado correctamente' });
    });
  });

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});