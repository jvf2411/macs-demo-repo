IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MACS_DEMO')
BEGIN
    CREATE DATABASE MACS_DEMO;
END;
GO

USE MACS_DEMO;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='solicitudes' AND xtype='U')
BEGIN
    CREATE TABLE solicitudes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        paciente NVARCHAR(100) NOT NULL,
        tipo_nutricion NVARCHAR(50) NOT NULL,
        centro_medico NVARCHAR(100) NOT NULL,
        prioridad NVARCHAR(50) NOT NULL,
        observacion NVARCHAR(255),
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
END;
GO

INSERT INTO solicitudes 
(paciente, tipo_nutricion, centro_medico, prioridad, observacion)
VALUES
('Paciente Demo 001', 'Parenteral', 'Centro Médico Demo A', 'Crítica', 'Solicitud inicial de prueba'),
('Paciente Demo 002', 'Enteral', 'Centro Médico Demo B', 'Normal', 'Registro ficticio para validación');
GO
