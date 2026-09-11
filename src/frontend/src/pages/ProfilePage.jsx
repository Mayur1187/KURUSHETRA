import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <AppLayout>
      <h1>Profile</h1>
      <Card title="Account">
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Name:</strong> {user?.user_metadata?.name || "—"}
        </p>
        <p>
          <strong>User ID:</strong> {user?.id}
        </p>
        <Button variant="secondary" onClick={handleSignOut}>
          Log out
        </Button>
      </Card>
    </AppLayout>
  );
}

export default ProfilePage;
