namespace Example.Entities;

public record Todo : BaseEntity
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public required Status Status { get; set; }

    public required string UserId { get; init; }
}
