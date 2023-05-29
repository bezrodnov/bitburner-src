import React from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { Modal } from "../../../ui/React/Modal";
import { Product } from "../../Product";
import { useDivision } from "../Context";

interface IProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  rerender: () => void;
}

// Create a popup that lets the player discontinue a product
export function DiscontinueProductModal(props: IProps): React.ReactElement {
  const division = useDivision();
  function discontinue(): void {
    division.discontinueProduct(props.product.name);
    props.onClose();
    props.rerender();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Are you sure you want to do this? Discontinuing a product removes it completely and permanently. You will no
        longer produce this product and all of its existing stock will be removed and left unsold
      </Typography>
      <Button onClick={discontinue}>Discontinue</Button>
    </Modal>
  );
}
