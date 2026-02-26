import SessionsPage from "../SessionsPage";   ///   ../SessionsPage
import StudentLayout from "../../components/shared/StudentLayout";

export default function StudentSessionsPage() {
  return <SessionsPage Layout={StudentLayout} role="student" />;
}
