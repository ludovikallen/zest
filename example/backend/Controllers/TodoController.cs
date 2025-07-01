using Example.Entities;
using Example.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Example.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class TodoController(ITodoRepository todoRepository, ILogger<TodoController> logger) : ControllerBase
{
    [HttpGet(Name = "GetTodos")]
    public IEnumerable<Todo> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null) 
        {
            return todoRepository.GetTodos(userId);
        }

        return [];
    }

    [HttpGet("{id:guid}", Name = "GetTodoById")]
    public ActionResult<Todo> Get(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (todo.UserId != userId)
        {
            return Forbid();
        }

        return Ok(todo);
    }

    [HttpPost(Name = "CreateTodo")]
    public ActionResult<Todo> Post([FromBody] CreateTodoRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var todo = new Todo
        {
            Title = request.Title,
            Description = request.Description,
            Status = Status.Todo,
            UserId = userId
        };

        try
        {
            todoRepository.InsertTodo(todo);
            todoRepository.Save();
            return CreatedAtRoute("GetTodoById", new { id = todo.Id }, todo);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating todo for user {UserId}", userId);
            return StatusCode(500, "An error occurred while creating the todo.");
        }
    }

    [HttpPut("{id:guid}", Name = "UpdateTodo")]
    public IActionResult Put(Guid id, [FromBody] UpdateTodoRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingTodo = todoRepository.GetTodoById(id);
        if (existingTodo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (existingTodo.UserId != userId)
        {
            return Forbid();
        }

        try
        {
            todoRepository.UpdateTodo(existingTodo);

            existingTodo.Title = request.Title;
            existingTodo.Description = request.Description;
            existingTodo.Status = request.Status;
            existingTodo.UpdatedDate = DateTime.UtcNow;

            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating todo {TodoId} for user {UserId}", id, userId);
            return StatusCode(500, "An error occurred while updating the todo.");
        }
    }

    [HttpDelete("{id:guid}", Name = "DeleteTodo")]
    public IActionResult Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (todo.UserId != userId)
        {
            return Forbid();
        }

        try
        {
            todoRepository.DeleteTodo(id);
            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting todo {TodoId} for user {UserId}", id, userId);
            return StatusCode(500, "An error occurred while deleting the todo.");
        }
    }
}

public record CreateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
}

public record UpdateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required Status Status { get; init; }
}