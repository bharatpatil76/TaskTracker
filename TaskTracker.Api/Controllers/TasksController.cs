using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskTracker.Api.Data;
using TaskTracker.Api.Models;
using System.Security.Claims;


namespace TaskTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]                       // → /api/tasks
public class TasksController(AppDbContext db) : ControllerBase
{
    // "sub" from the token (.NET maps it to NameIdentifier)
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Tasks.Where(t => t.UserId == UserId)
                         .OrderByDescending(t => t.CreatedAt).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await FindOwnTask(id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create(TaskItem task)
    {
        task.UserId = UserId;                     // never trust the client for this
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TaskItem input)
    {
        var task = await FindOwnTask(id);
        if (task is null) return NotFound();

        task.Title = input.Title;
        task.IsDone = input.IsDone;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await FindOwnTask(id);
        if (task is null) return NotFound();

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<TaskItem?> FindOwnTask(int id) =>
        db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
}