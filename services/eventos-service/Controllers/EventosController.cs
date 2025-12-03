using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventosService.Data;
using EventosService.Models;

namespace EventosService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventosController : ControllerBase
{
    private readonly EventosDbContext _context;

    public EventosController(EventosDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ListarEventos(
        [FromQuery] string? status = null,
        [FromQuery] string? categoria = null,
        [FromQuery] DateTime? dataInicio = null,
        [FromQuery] DateTime? dataFim = null)
    {
        var query = _context.Eventos.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(e => e.Status == status);
        }

        if (!string.IsNullOrEmpty(categoria))
        {
            query = query.Where(e => e.Categoria == categoria);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(e => e.DataInicio >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(e => e.DataFim <= dataFim.Value);
        }

        var eventos = await query
            .OrderBy(e => e.DataInicio)
            .Select(e => new
            {
                e.Id,
                e.Titulo,
                e.Descricao,
                e.DataInicio,
                e.DataFim,
                e.Localizacao,
                e.CapacidadeMaxima,
                e.VagasDisponiveis,
                e.ValorInscricao,
                e.Categoria,
                e.Status
            })
            .ToListAsync();

        return Ok(new
        {
            total = eventos.Count,
            eventos = eventos
        });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> BuscarEvento(int id)
    {
        var evento = await _context.Eventos
            .Where(e => e.Id == id)
            .Select(e => new
            {
                e.Id,
                e.Titulo,
                e.Descricao,
                e.DataInicio,
                e.DataFim,
                e.Localizacao,
                e.CapacidadeMaxima,
                e.VagasDisponiveis,
                e.ValorInscricao,
                e.Categoria,
                e.Status,
                e.CreatedAt,
                e.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (evento == null)
        {
            return NotFound(new { message = "Evento não encontrado" });
        }

        return Ok(evento);
    }
}

