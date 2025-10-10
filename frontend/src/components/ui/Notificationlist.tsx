'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Define the Notification interface
interface Notification {
  _id: string;
  recipient: string; // User ID
  message: string;
  type: 'PO_CREATED' | 'PO_UPDATED' | 'PO_DELETED' | 'PO_APPROVED' | 'PO_REJECTED' | 'PO_VENDOR_EDITED' | 'PO_ADMIN_UPDATED' | 'BILL_CREATED' | 'BILL_APPROVED' | 'BILL_REJECTED' | 'PO_VENDOR_ACCEPTED_ADMIN_CHANGES' | 'PO_VENDOR_REJECTED_ADMIN_CHANGES' | 'BILL_ADMIN_UPDATED'; // Added new types
  relatedId?: string; // ID of the related PO or Bill
  relatedModel?: 'PurchaseOrder' | 'Bill' | 'Vendor' | 'User';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the relevant page based on notification type and relatedId
    if (notification.relatedId) {
      if (['PO_CREATED', 'PO_UPDATED', 'PO_APPROVED', 'PO_REJECTED', 'PO_VENDOR_EDITED', 'PO_ADMIN_UPDATED', 'PO_VENDOR_ACCEPTED_ADMIN_CHANGES', 'PO_VENDOR_REJECTED_ADMIN_CHANGES'].includes(notification.type)) {
        router.push(`/vendor/purchase-orders/${notification.relatedId}`);
      } else if (['BILL_CREATED', 'BILL_APPROVED', 'BILL_REJECTED'].includes(notification.type)) {
        router.push(`/bills/${notification.relatedId}`);
      }
    }
    // Optional: You might want to add an API call here to mark the notification as read
    // e.g., configuredAxiosInstance.put(`/api/notifications/${notification._id}/read`);
  };

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <p className="text-gray-600">No new notifications.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-4 rounded-md shadow-sm cursor-pointer transition-all duration-200 ease-in-out
                                    ${notification.isRead ? 'bg-gray-50 text-gray-500' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}
            onClick={() => {
              // Navigate to the relevant page based on notification type and relatedId
              if (notification.relatedId) {
                if (['PO_CREATED', 'PO_UPDATED', 'PO_APPROVED', 'PO_REJECTED', 'PO_VENDOR_EDITED', 'PO_ADMIN_UPDATED', 'PO_VENDOR_ACCEPTED_ADMIN_CHANGES', 'PO_VENDOR_REJECTED_ADMIN_CHANGES'].includes(notification.type)) {
                  router.push(`/vendor/purchase-orders/${notification.relatedId}`);
                } else if (['BILL_CREATED', 'BILL_APPROVED', 'BILL_REJECTED', 'BILL_ADMIN_UPDATED'].includes(notification.type)) {
                  router.push(`/bills/${notification.relatedId}`);
                }
              }
            }}
          >
            <p className="font-medium">
              {/* Display different messages based on notification type */}
              {notification.type === 'PO_CREATED' && `New Purchase Order: ${notification.message}`}
              {notification.type === 'PO_UPDATED' && `Purchase Order Updated: ${notification.message}`}
              {notification.type === 'PO_DELETED' && `Purchase Order Deleted: ${notification.message}`}
              {notification.type === 'PO_APPROVED' && `Purchase Order Approved: ${notification.message}`}
              {notification.type === 'PO_REJECTED' && `Purchase Order Rejected: ${notification.message}`}
              {notification.type === 'PO_VENDOR_EDITED' && `Vendor Edited PO: ${notification.message}`}
              {notification.type === 'PO_ADMIN_UPDATED' && `Admin Updated PO: ${notification.message}`}
              {notification.type === 'BILL_CREATED' && `New Bill: ${notification.message}`}
              {notification.type === 'BILL_APPROVED' && `Bill Approved: ${notification.message}`}
              {notification.type === 'BILL_REJECTED' && `Bill Rejected: ${notification.message}`}
              {notification.type === 'PO_VENDOR_ACCEPTED_ADMIN_CHANGES' && `Vendor Accepted Admin Changes: ${notification.message}`} {/* NEW MESSAGE */}
              {notification.type === 'PO_VENDOR_REJECTED_ADMIN_CHANGES' && `Vendor Rejected Admin Changes: ${notification.message}`} {/* NEW MESSAGE */}
              {notification.type === 'BILL_ADMIN_UPDATED' && `Bill Updated: ${notification.message}`}
              {/* Add more message types here */}
            </p>
            <p className="text-sm mt-1">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export type { Notification };
export default NotificationList;
