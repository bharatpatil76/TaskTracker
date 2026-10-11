namespace TaskTracker.Api.Models
{
    public class TaskItem
    {
        public int Id { get; set; }                 // Primary key (by convention)
        public string Title { get; set; } = "";
        public bool IsDone { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = "";         
    }
}
