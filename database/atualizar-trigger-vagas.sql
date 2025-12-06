-- Atualizar trigger para liberar vagas quando inscrição for deletada
-- Execute este script no banco de dados eventos_db

-- Primeiro, remover o trigger existente
DROP TRIGGER IF EXISTS trigger_atualizar_vagas ON inscricoes;

-- Recriar a função atualizada
CREATE OR REPLACE FUNCTION atualizar_vagas_evento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ativa' THEN
        -- Reduzir vaga quando inserir inscrição ativa
        UPDATE eventos 
        SET vagas_disponiveis = vagas_disponiveis - 1
        WHERE id = NEW.evento_id AND vagas_disponiveis > 0;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'ativa' AND NEW.status = 'cancelada' THEN
            -- Liberar vaga quando cancelar
            UPDATE eventos 
            SET vagas_disponiveis = vagas_disponiveis + 1
            WHERE id = NEW.evento_id;
        ELSIF OLD.status = 'cancelada' AND NEW.status = 'ativa' THEN
            -- Ocupar vaga quando reativar
            UPDATE eventos 
            SET vagas_disponiveis = vagas_disponiveis - 1
            WHERE id = NEW.evento_id AND vagas_disponiveis > 0;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ativa' THEN
        -- Liberar vaga quando deletar inscrição ativa
        UPDATE eventos 
        SET vagas_disponiveis = vagas_disponiveis + 1
        WHERE id = OLD.evento_id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger com DELETE
CREATE TRIGGER trigger_atualizar_vagas 
    AFTER INSERT OR UPDATE OR DELETE ON inscricoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_vagas_evento();

-- Confirmar
SELECT 'Trigger atualizado com sucesso!' AS status;

