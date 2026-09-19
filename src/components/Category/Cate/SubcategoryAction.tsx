"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { BASE_URL } from "@/api/axios";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AddSubcategoryModal from "@/components/ui/AddSubcategoryModal";

interface SubcategoryActionProps {
  subcategoryId: string;
  onSubcategoryDeleted: () => void;
  categories: any[];
}

const SubcategoryAction: React.FC<SubcategoryActionProps> = ({
  subcategoryId,
  onSubcategoryDeleted,
  categories,
}) => {
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const isAdmin = authContext?.role?.toLowerCase() === "admin";
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!isAdmin || !window.confirm("This subcategory will be permanently deleted and cannot be recovered. Continue?")) return;
    try {
      await axios.delete(`${BASE_URL}/sub-category/${subcategoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Subcategory deleted.");
      onSubcategoryDeleted();
    } catch (error) {
      toast.error("Error deleting subcategory.");
    }
  };

  return (
    <div className="flex space-x-2">
      {isAdmin && <Button variant="outline" onClick={handleDelete}>
        Delete
      </Button>}
      <Button variant="outline" onClick={() => setIsEditOpen(true)}>
        Edit
      </Button>

      {isEditOpen && (
        <AddSubcategoryModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubcategoryAdded={() => {
            setIsEditOpen(false);
            onSubcategoryDeleted();
          }}
          subcategoryToEdit={subcategoryId}
          categories={categories} // optionally pass categories list if needed
        />
      )}
    </div>
  );
};

export default SubcategoryAction;
