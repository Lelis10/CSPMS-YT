Create database Cspmsyt;
use Cspmsyt;

CREATE TABLE `users` (
   `name` varchar(255) NOT NULL,
   `id` int NOT NULL AUTO_INCREMENT,
   `email` varchar(255) NOT NULL,
   `password` varchar(255) NOT NULL,
   `role` int NOT NULL,
   PRIMARY KEY (`id`)
 );
 
CREATE TABLE `proyectos` (
   `id` int NOT NULL AUTO_INCREMENT,
   `nombre_proyecto` varchar(255) NOT NULL,
   `escuela` varchar(100) NOT NULL,
   `estado` enum('pendiente','aceptado','en ejecucion','cerrado') NOT NULL,
   `fecha_creacion` date DEFAULT NULL,
   `fecha_finalizacion` date DEFAULT NULL,
   `director` varchar(255) DEFAULT NULL,
   `descripcion` varchar(255) DEFAULT NULL,
   `director_id` int DEFAULT NULL,
   `FormatoV1` blob,
   PRIMARY KEY (`id`),
   KEY `proyecto_ibfk_1` (`director_id`),
   CONSTRAINT `proyecto_ibfk_1` FOREIGN KEY (`director_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 );
 
CREATE TABLE `user_proyecto` (
   `user_id` int NOT NULL,
   `proyecto_id` int NOT NULL,
   `director_id` int DEFAULT NULL,
   PRIMARY KEY (`user_id`,`proyecto_id`),
   KEY `proyecto_id` (`proyecto_id`),
   KEY `coordinador_id` (`director_id`),
   CONSTRAINT `user_proyecto_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
   CONSTRAINT `user_proyecto_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
   CONSTRAINT `user_proyecto_ibfk_3` FOREIGN KEY (`director_id`) REFERENCES `users` (`id`)
 );
 
 CREATE TABLE `solicitud` (
   `id` int NOT NULL AUTO_INCREMENT,
   `user_id` int NOT NULL,
   `proyecto_id` int NOT NULL,
   `estado` enum('pendiente','aceptado','rechazado') NOT NULL,
   `FormatoV2` longblob,
   PRIMARY KEY (`id`),
   KEY `fk_solicitud_user_idx` (`user_id`),
   KEY `fk_solicitud_proyecto_idx` (`proyecto_id`),
   CONSTRAINT `solicitud_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
   CONSTRAINT `solicitud_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
 );
 
 
 CREATE TABLE `Estudiantes` (
   `id` int NOT NULL,
   `nombre` varchar(255) NOT NULL,
   `apellido` varchar(255) NOT NULL,
   `escuela` varchar(100) NOT NULL,
   `semestre` varchar(50) DEFAULT NULL,
   `cedula` int NOT NULL,
   `telefono` int NOT NULL,
   PRIMARY KEY (`cedula`),
   KEY `estudiantes_ibfk_1` (`id`),
   CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 );
 
 CREATE TABLE `Profesores` (
   `id` int NOT NULL,
   `nombre` varchar(255) NOT NULL,
   `apellido` varchar(255) NOT NULL,
   PRIMARY KEY (`id`),
   CONSTRAINT `profesores_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 );
 
 CREATE TABLE `Administrativos` (
   `id` int NOT NULL,
   `nombre` varchar(255) NOT NULL,
   `apellido` varchar(255) NOT NULL,
   PRIMARY KEY (`id`),
   CONSTRAINT `administrativos_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 );