import SessionsPage from "../SessionsPage";    //   ../SessionsPage
import TutorLayout from "../../components/shared/TutorLayout";
import { useTutorConnections } from "../../hooks/useTutor";

export default function TutorSessionsPage() {
  const { pending } = useTutorConnections();
  return <SessionsPage Layout={TutorLayout} role="tutor" pendingCount={pending.length} />;
}
