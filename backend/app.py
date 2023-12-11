from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import g
from uuid import uuid4
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import Enum
import jwt
import os
import datetime
from flask import current_app
from dotenv import load_dotenv

app = Flask(__name__)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

CORS(app)
load_dotenv()


@app.before_request
def before_request_handler():
    g.request_id = uuid4()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
db = SQLAlchemy(app)
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Código para definir el decorador role_required
def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('x-access-token')
            if not token:
                return jsonify({'message': 'Token not found'}), 401

            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_role = decoded_token.get('role')

            if user_role not in roles:
                return jsonify({'message': 'Unauthorized'}), 403

            return fn(*args, **kwargs)

        return decorated_function

    return wrapper


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)

class Proyecto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_proyecto = db.Column(db.String(255), nullable=False)
    escuela = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.Enum('pendiente', 'aceptado', 'en ejecucion', 'cerrado'), nullable=False)
    fecha_creacion = db.Column(db.Date)
    fecha_finalizacion = db.Column(db.Date)
    director = db.Column(db.String(255))
    descripcion = db.Column(db.String(255))
    director_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    FormatoV1 = db.Column(db.String(255))

class UserProyecto(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyecto.id'), primary_key=True)
    director_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", backref="user_proyecto", foreign_keys=[user_id])
    proyecto = db.relationship("Proyecto", backref="user_proyecto", foreign_keys=[proyecto_id])
    director = db.relationship("User", foreign_keys=[director_id])


class Solicitud(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyecto.id'), nullable=False)
    estado = db.Column(db.Enum('pendiente', 'aceptado', 'rechazado'), nullable=False)
    FormatoV2 = db.Column(db.BLOB)
    user = db.relationship("User", backref="solicitud")
    proyecto = db.relationship("Proyecto", backref="solicitud")

class Estudiantes(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    escuela = db.Column(db.String(100), nullable=False)
    semestre = db.Column(db.String(50))
    cedula = db.Column(db.Integer, unique=True, nullable=False)
    telefono = db.Column(db.Integer, nullable=False)
    user = db.relationship("User", backref="estudiantes")

class Profesores(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    user = db.relationship("User", backref="profesores")

class Administrativos(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    user = db.relationship("User", backref="administrativos")

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    method = db.Column(db.String(50))
    time = db.Column(db.DateTime)
    level = db.Column(db.String(20))
    message = db.Column(db.String(255))

def log_audit_event(user_id, method, level, message):
    new_audit_log = AuditLog(
        user_id=user_id,
        method=method,
        time=datetime.datetime.now(),
        level=level,
        message=message
    )
    db.session.add(new_audit_log)
    db.session.commit()

# Funciones para acceder a la base de datos
@app.route('/register', methods=['POST'])
@limiter.limit("10 per minute")
def register_user():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        # Comprobamos si el email ya está registrado
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {'message': 'El email ya está registrado'}, 409

        # Ciframos la contraseña antes de guardarla
        hashed_password = generate_password_hash(password)

        # Guardamos el usuario en la base de datos
        new_user = User(name=name, email=email, password=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()

        log_audit_event(str(g.request_id), 'register', 'INFO', 'Registro de usuario exitoso')
        
        return {'message': 'Usuario registrado correctamente'}, 201
    except Exception as e:
        log_audit_event(str(g.request_id), 'register', 'ERROR', f'Error al registrar usuario: {str(e)}')
        return {'message': 'Error al registrar el usuario'}, 500
    
@app.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if not user:
            return {'message': 'Credenciales inválidas'}, 401

        if not check_password_hash(user.password, password):
            return {'message': 'Credenciales inválidas'}, 401

        # Generar el token JWT
        token = jwt.encode({
            'email': user.email,
            'id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'])    
        
        log_audit_event(str(g.request_id), 'login', 'INFO', 'Inicio de sesión exitoso')

        return {'message': 'Inicio de sesión exitoso', 'token': token}, 200
    except Exception as e:
        log_audit_event(str(g.request_id), 'login', 'ERROR', f'Error al iniciar sesión: {str(e)}')
        return {'message': 'Error al iniciar sesión'}, 500  

@app.route('/profile', methods=['GET'])
def get_user_profile():
    try:
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token not found'}), 401

        # Verificar el token y obtener los detalles del usuario
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded_token.get('id')

        # Realizar la lógica para obtener el perfil del usuario según el user_id
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Preparar y devolver los detalles del usuario
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }

        log_audit_event(str(g.request_id), 'get_user_profile', 'INFO', 'Perfil de usuario obtenido')
        
        return jsonify(user_data), 200

    except Exception as e:
        log_audit_event(str(g.request_id), 'get_user_profile', 'ERROR', f'Error al obtener perfil: {str(e)}')
        return jsonify({'message': 'Error fetching user profile'}), 500

# Ruta para obtener todos los proyectos
@app.route('/all-projects', methods=['GET'])
def get_all_projects():
    try:
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token not found'}), 401

        # Verificar el token y obtener los detalles del usuario
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded_token.get('id')

        # Suponiendo que la lista de proyectos esté en la tabla 'Proyecto'
        all_projects = Proyecto.query.all()

        # Preparar y devolver los proyectos en formato JSON
        projects_list = []
        for project in all_projects:
            project_data = {
                'id': project.id,
                'nombre_proyecto': project.nombre_proyecto,
                'escuela': project.escuela,
                'estado': project.estado,
                'fecha_creacion': project.fecha_creacion.strftime('%Y-%m-%d') if project.fecha_creacion else None,
                'fecha_finalizacion': project.fecha_finalizacion.strftime('%Y-%m-%d') if project.fecha_finalizacion else None,
                'director': project.director,
                'descripcion': project.descripcion,
                'director_id': project.director_id,
                'FormatoV1': project.FormatoV1,
            }
            projects_list.append(project_data)

        log_audit_event(str(g.request_id), 'get_all_projects', 'INFO', 'Obtener todos los proyectos')
        
        return jsonify(projects_list), 200

    except Exception as e:
        log_audit_event(str(g.request_id), 'get_all_projects', 'ERROR', f'Error al obtener proyectos: {str(e)}')
        return jsonify({'message': 'Error fetching projects'}), 500



@app.route('/projects', methods=['GET'])
def get_user_projects():
    try:
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token not found'}), 401

        # Verificar el token y obtener los detalles del usuario
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded_token.get('id')

        # Obtener los proyectos asociados al usuario desde la tabla UserProyecto
        user_projects = UserProyecto.query.filter_by(user_id=user_id).all()

        # Recopilar detalles adicionales de los proyectos desde la tabla Proyecto
        user_projects_list = []
        for user_project in user_projects:
            project = Proyecto.query.filter_by(id=user_project.proyecto_id).first()
            if project:
                project_data = {
                    'proyecto_id': project.id,
                    'nombre_proyecto': project.nombre_proyecto,
                    'escuela': project.escuela,
                    'nombre_coordinador': project.director,
                
                }
                user_projects_list.append(project_data)
        log_audit_event(str(g.request_id), 'get_user_projects', 'INFO', 'Obtener proyectos del usuario')
        return jsonify(user_projects_list), 200

    except Exception as e:
        log_audit_event(str(g.request_id), 'get_user_projects', 'ERROR', f'Error al obtener proyectos del usuario: {str(e)}')
        return jsonify({'message': 'Error fetching user projects'}), 500
    
@app.route('/propuesta', methods=['POST'])
@role_required('Profesor', 'Administrativo')
def enviar_propuesta():
    try:
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token not found'}), 401

        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded_token.get('id')

        # Obtener datos de la propuesta desde la solicitud
        nombre_proyecto = request.form.get('nombre_proyecto')
        escuela = request.form.get('escuela')
        descripcion = request.form.get('descripcion')
        nombre_director = request.form.get('director')

        # Manejar el archivo adjunto (FormatoV1)
        archivo_formato_v1 = request.files['FormatoV1']
        
        if archivo_formato_v1:
            # Guardar el archivo en el sistema de archivos del servidor
            nombre_archivo = secure_filename(archivo_formato_v1.filename)
            ruta_archivo = os.path.join(app.config['UPLOAD_FOLDER'], nombre_archivo)
            archivo_formato_v1.save(ruta_archivo)

        # Obtener la fecha de creación y finalización desde el formulario
        fecha_creacion = request.form.get('fechaCreacion')
        fecha_finalizacion = request.form.get('fechaFinalizacion')

        # Convertir las cadenas de fecha a objetos de fecha de Python
        fecha_creacion = datetime.datetime.strptime(request.form.get('fechaCreacion'), '%Y-%m-%d')
        fecha_finalizacion = datetime.datetime.strptime(request.form.get('fechaFinalizacion'), '%Y-%m-%d')

        # Crear un nuevo proyecto
        nuevo_proyecto = Proyecto(
            nombre_proyecto=nombre_proyecto,
            escuela=escuela,
            estado='pendiente',  # Estado inicial pendiente para la nueva propuesta
            fecha_creacion=fecha_creacion,  # Usar la fecha proporcionada desde el formulario
            fecha_finalizacion=fecha_finalizacion,  # Usar la fecha de finalización proporcionada desde el formulario
            director_id=user_id,  # El usuario actual será el director del proyecto
            director=nombre_director,  # Nombre del director
            descripcion=descripcion,
            FormatoV1=ruta_archivo   # Guardar el archivo adjunto en el modelo Proyecto
        )

        # Guardar el nuevo proyecto en la base de datos
        db.session.add(nuevo_proyecto)
        db.session.commit()

        # Registrar la relación en la tabla UserProyecto
        nueva_relacion = UserProyecto(
            user_id=user_id,
            proyecto_id=nuevo_proyecto.id,
            director_id=user_id  # El usuario actual también será el director en UserProyecto
        )

        # Guardar la relación en la base de datos
        db.session.add(nueva_relacion)
        db.session.commit()

        log_audit_event(str(g.request_id), 'enviar_propuesta', 'INFO', 'Propuesta enviada correctamente')
        return jsonify({'message': 'Propuesta enviada correctamente'}), 201

    except Exception as e:
        log_audit_event(str(g.request_id), 'enviar_propuesta', 'ERROR', f'Error al enviar la propuesta: {str(e)}')
        return jsonify({'message': 'Error al enviar la propuesta'}), 500


@app.route('/user_role', methods=['GET'])
def get_user_role():
    try:
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token not found'}), 401
        
        # Por ejemplo, asumiendo que el token contiene el rol como parte de la carga útil (payload)
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_role = decoded_token.get('role')

        if not user_role:
            return jsonify({'message': 'Role not found in token'}), 400
        
        log_audit_event(str(g.request_id), 'get_user_role', 'INFO', 'Obtener el rol del usuario')
        
        # Devolver el rol del usuario al frontend
        return jsonify({'role': user_role}), 200

    except Exception as e:
        log_audit_event(str(g.request_id), 'get_user_role', 'ERROR', f'Error obteniendo el rol del usuario: {str(e)}')
        return jsonify({'message': 'Error getting user role'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)