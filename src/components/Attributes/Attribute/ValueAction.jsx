import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { toast } from "react-hot-toast";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const ValueAction = ({ attributeId, valuesToDelete, onValueDeleted }) => {
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const handleDelete = async () => {
    try {
      await axios.put(
        `/api/v1/attributes/${attributeId}/remove`,
        { valuesToDelete }, // Send the values to be removed in the correct format
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Values deleted successfully.");
      onValueDeleted(); // Callback to refresh values
      router.refresh();
    } catch (error) {
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={handleDelete}>
        Delete Selected Values
      </Button>
      {/* Optionally, you can add an Edit button here */}
    </div>
  );
};

export default ValueAction;
