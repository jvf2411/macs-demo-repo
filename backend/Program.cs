using Microsoft.Data.SqlClient;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

string GetConnectionString()
{
    var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
    var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "1433";
    var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "MACS_DEMO";
    var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "sa";
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "YourStrong!Passw0rd";

    return $"Server={dbHost},{dbPort};Database={dbName};User Id={dbUser};Password={dbPassword};TrustServerCertificate=True;Encrypt=False;";
}

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "OK",
        service = "macs-backend-dotnet",
        technology = ".NET / C# Web API",
        timestamp = DateTime.UtcNow
    });
});

app.MapGet("/api/solicitudes", async () =>
{
    var solicitudes = new List<SolicitudDto>();

    await using var connection = new SqlConnection(GetConnectionString());
    await connection.OpenAsync();

    var query = @"
        SELECT id, paciente, tipo_nutricion, centro_medico, prioridad, observacion, fecha_creacion
        FROM solicitudes
        ORDER BY fecha_creacion DESC";

    await using var command = new SqlCommand(query, connection);
    await using var reader = await command.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        solicitudes.Add(new SolicitudDto
        {
            Id = reader.GetInt32(0),
            Paciente = reader.GetString(1),
            TipoNutricion = reader.GetString(2),
            CentroMedico = reader.GetString(3),
            Prioridad = reader.GetString(4),
            Observacion = reader.IsDBNull(5) ? "" : reader.GetString(5),
            FechaCreacion = reader.GetDateTime(6)
        });
    }

    return Results.Ok(solicitudes);
});

app.MapPost("/api/solicitudes", async (SolicitudCreateRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Paciente) ||
        string.IsNullOrWhiteSpace(request.TipoNutricion) ||
        string.IsNullOrWhiteSpace(request.CentroMedico) ||
        string.IsNullOrWhiteSpace(request.Prioridad))
    {
        return Results.BadRequest(new
        {
            error = "Los campos paciente, tipo_nutricion, centro_medico y prioridad son obligatorios"
        });
    }

    await using var connection = new SqlConnection(GetConnectionString());
    await connection.OpenAsync();

    var query = @"
        INSERT INTO solicitudes
        (paciente, tipo_nutricion, centro_medico, prioridad, observacion)
        VALUES
        (@paciente, @tipo_nutricion, @centro_medico, @prioridad, @observacion)";

    await using var command = new SqlCommand(query, connection);

    command.Parameters.AddWithValue("@paciente", request.Paciente);
    command.Parameters.AddWithValue("@tipo_nutricion", request.TipoNutricion);
    command.Parameters.AddWithValue("@centro_medico", request.CentroMedico);
    command.Parameters.AddWithValue("@prioridad", request.Prioridad);
    command.Parameters.AddWithValue("@observacion", request.Observacion ?? "");

    await command.ExecuteNonQueryAsync();

    return Results.Created("/api/solicitudes", new
    {
        message = "Solicitud registrada correctamente",
        technology = ".NET / C# Web API"
    });
});

app.Run();

public class SolicitudDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("paciente")]
    public string Paciente { get; set; } = "";

    [JsonPropertyName("tipo_nutricion")]
    public string TipoNutricion { get; set; } = "";

    [JsonPropertyName("centro_medico")]
    public string CentroMedico { get; set; } = "";

    [JsonPropertyName("prioridad")]
    public string Prioridad { get; set; } = "";

    [JsonPropertyName("observacion")]
    public string Observacion { get; set; } = "";

    [JsonPropertyName("fecha_creacion")]
    public DateTime FechaCreacion { get; set; }
}

public class SolicitudCreateRequest
{
    [JsonPropertyName("paciente")]
    public string? Paciente { get; set; }

    [JsonPropertyName("tipo_nutricion")]
    public string? TipoNutricion { get; set; }

    [JsonPropertyName("centro_medico")]
    public string? CentroMedico { get; set; }

    [JsonPropertyName("prioridad")]
    public string? Prioridad { get; set; }

    [JsonPropertyName("observacion")]
    public string? Observacion { get; set; }
}
