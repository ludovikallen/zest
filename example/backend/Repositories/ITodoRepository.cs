using Example.Entities;

namespace Example.Repositories;

public interface ITodoRepository : IDisposable
{
    IEnumerable<Todo> GetTodos(string userId);

    Todo? GetTodoById(Guid id);

    void InsertTodo(Todo todo);

    void DeleteTodo(Guid id);

    void UpdateTodo(Todo todo);

    void Save();
}
