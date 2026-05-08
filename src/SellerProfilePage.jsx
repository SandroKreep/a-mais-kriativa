import React from 'react';
import { useParams } from 'react-router-dom';

export default function SellerProfilePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Seller Profile Page</h1>
      <p>Seller ID: {id}</p>
      {/* Add seller profile details here */}
    </div>
  );
}