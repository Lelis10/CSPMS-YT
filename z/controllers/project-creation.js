// Controlador para la creación de proyectos
async function createProject(req, res, db) {
    try {
      // Obtener los datos del proyecto y coordinador desde el body de la solicitud
      const { nombre_proyecto, escuela, estado, coordinador_id } = req.body;
  
      // Realizar la inserción del proyecto en la tabla proyectos
      const insertProjectQuery = `
        INSERT INTO proyectos (nombre_proyecto, escuela, estado)
        VALUES (?, ?, ?)
      `;
      const insertProjectParams = [nombre_proyecto, escuela, estado];
      const [insertProjectResult] = await db.query(insertProjectQuery, insertProjectParams);
  
      // Obtener el id del proyecto recién insertado
      const proyecto_id = insertProjectResult.insertId;
  
      // Realizar la inserción del coordinador en la tabla user_proyecto
      const insertCoordinatorQuery = `
        INSERT INTO user_proyecto (user_id, proyecto_id, coordinador_id)
        VALUES (?, ?, ?)
      `;
      const insertCoordinatorParams = [coordinador_id, proyecto_id, coordinador_id];
      await db.query(insertCoordinatorQuery, insertCoordinatorParams);
  
      // Enviar una respuesta de éxito al cliente
      res.json({ message: 'Proyecto creado exitosamente' });
    } catch (error) {
      console.error('Error al crear el proyecto: ', error);
      res.status(500).json({ error: 'Error al crear el proyecto' });
    }
  }
  
  module.exports = {
    createProject, // Agrega la función del controlador para la creación de proyectos
  };
  