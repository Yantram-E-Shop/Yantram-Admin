"use client";

import axios from "axios";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { toast } from "react-hot-toast";
import { BASE_URL } from "@/api/axios";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";


interface SubcategoryActionProps {
  subcategoryId: string;
  onSubcategoryDeleted: () => void; // Callback to refresh subcategories
}

const SubcategoryAction: React.FC<SubcategoryActionProps> = ({
  subcategoryId,
  onSubcategoryDeleted,
}) => {

      const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  
  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/sub-category/${subcategoryId}`, {
         headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }); // Adjust URL as per your API
      toast.success("Subcategory deleted.");
      onSubcategoryDeleted(); // Call the function to refresh
    } catch (error) {
      toast.error("Error deleting subcategory.");
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={handleDelete}>
        Delete
      </Button>
      {/* You can add Edit button here as well */}
    </div>
  );
};

export default SubcategoryAction;
