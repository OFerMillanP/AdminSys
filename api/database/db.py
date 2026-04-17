import psycopg2

try:
    # Establecer la conexión
    conn = psycopg2.connect(
        database="tu_base_datos",
        user="tu_usuario",
        password="tu_password",
        host="127.0.0.1",
        port="5432"
    )
    print("Conexión exitosa")

    # Crear un cursor para ejecutar consultas
    cur = conn.cursor()
    cur.execute("SELECT version();")
    db_version = cur.fetchone()
    print(f"Versión de PostgreSQL: {db_version}")

    # Cerrar cursor y conexión
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")

psycopg2.connect()