import FeedbackForm from "../../../components/settings/FeedbackForm";

export default function ReportBugScreen() {

    return (
        <FeedbackForm
            type="Bug Report"
            title="Report a bug"
            description="Please describe the bug you encountered. Be as specific as possible, including steps to reproduce the issue."
            placeholder="e.g., The app crashes when I tap X after doing Y."
        />
    );
}
