import FeedbackForm from '@/components/settings/FeedbackForm';

export default function AskQuestionScreen() {

    return (
        <FeedbackForm
            type="Question"
            title="Ask a question"
            description="Do you have questions about the app? Let us know below."
            placeholder="Type your question here..."
        />
    );
}
