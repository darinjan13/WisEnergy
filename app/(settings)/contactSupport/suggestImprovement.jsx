import FeedbackForm from '../../../components/settings/FeedbackForm';

export default function SuggestImprovementScreen() {

    return (
        <FeedbackForm
            type="Suggestion"
            title="Suggest an improvement"
            description="We're always looking for ways to get better! Share your ideas to improve the app."
            placeholder="Describe your idea and how it would improve the app."
        />
    );
}
