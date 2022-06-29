namespace CareApi.Models
{
    public class QNAMakerResponseModel
    {
        public Answer[] answers { get; set; }
        public bool activeLearningEnabled { get; set; }
    }

    public class Answer
    {
        public string[] questions { get; set; }
        public string answer { get; set; }
        public float score { get; set; }
        public int id { get; set; }
        public string source { get; set; }
        public bool isDocumentText { get; set; }
        public object[] metadata { get; set; }
        public Context context { get; set; }
    }

    public class Context
    {
        public bool isContextOnly { get; set; }
        public Prompt[] prompts { get; set; }
    }

    public class Prompt
    {
        public int displayOrder { get; set; }
        public int qnaId { get; set; }
        public string displayText { get; set; }
    }

}
