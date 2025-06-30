using Example.Entities;
using Microsoft.EntityFrameworkCore;

namespace Example.Repositories;
public class TodoRepository(ApplicationDbContext context) : ITodoRepository, IDisposable
{
    public void DeleteTodo(Guid id)
    {
        var todo = context.Todos.Find(id);
        if (todo != null)
        {
            context.Todos.Remove(todo);
        }
    }

    public Todo? GetTodoById(Guid id)
    {
        return context.Todos.Find(id);
    }

    public IEnumerable<Todo> GetTodos(string userId)
    {
        return context.Todos.Where(todo => todo.UserId == userId);
    }

    public void InsertTodo(Todo todo)
    {
        context.Todos.Add(todo);
    }

    public void UpdateTodo(Todo todo)
    {
        context.Entry(todo).State = EntityState.Modified;
    }

    public void Save()
    {
        context.SaveChanges();
    }

    private bool disposed = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!this.disposed)
        {
            if (disposing)
            {
                context.Dispose();
            }
        }
        this.disposed = true;
    }

    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }
}