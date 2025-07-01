namespace Example.Entities;

public record BaseEntity
{
    public Guid Id { get; } = Guid.NewGuid();

    public DateTime CreatedDate { get; } = DateTime.UtcNow;

    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}
