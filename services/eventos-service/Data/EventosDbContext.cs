using Microsoft.EntityFrameworkCore;
using EventosService.Models;

namespace EventosService.Data;

public class EventosDbContext : DbContext
{
    public EventosDbContext(DbContextOptions<EventosDbContext> options) : base(options)
    {
    }

    public DbSet<Evento> Eventos { get; set; }
    public DbSet<Inscricao> Inscricoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.ToTable("eventos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Titulo).HasColumnName("titulo").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao");
            entity.Property(e => e.DataInicio).HasColumnName("data_inicio").IsRequired();
            entity.Property(e => e.DataFim).HasColumnName("data_fim").IsRequired();
            entity.Property(e => e.Localizacao).HasColumnName("localizacao").HasMaxLength(255);
            entity.Property(e => e.CapacidadeMaxima).HasColumnName("capacidade_maxima");
            entity.Property(e => e.VagasDisponiveis).HasColumnName("vagas_disponiveis");
            entity.Property(e => e.ValorInscricao).HasColumnName("valor_inscricao").HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
            entity.Property(e => e.Categoria).HasColumnName("categoria").HasMaxLength(100);
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("ativo");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.DataInicio);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<Inscricao>(entity =>
        {
            entity.ToTable("inscricoes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id").IsRequired();
            entity.Property(e => e.EventoId).HasColumnName("evento_id").IsRequired();
            entity.Property(e => e.DataInscricao).HasColumnName("data_inscricao").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("ativa");
            entity.Property(e => e.PresencaRegistrada).HasColumnName("presenca_registrada").HasDefaultValue(false);
            entity.Property(e => e.DataPresenca).HasColumnName("data_presenca");
            entity.Property(e => e.CodigoInscricao).HasColumnName("codigo_inscricao").HasMaxLength(50).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.UsuarioId);
            entity.HasIndex(e => e.EventoId);
            entity.HasIndex(e => e.Status);
        });
    }
}





