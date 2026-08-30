# 🎬 Movie Ticket Booking Management Application

> **National Internship Program (NIP) · Pega Platform™ · Pega Academy · 2026**  
> **Pega Blueprint ID:** `BP-2415612` | **Organization / Client:** CineWave Entertainment

---

## 📌 Project Overview

The **Movie Ticket Booking Management Application** is an enterprise-grade low-code solution built on the **Pega Platform™** for **CineWave Entertainment**. It automates and streamlines the end-to-end movie ticket booking lifecycle, replacing traditional manual and offline processes with automated case management, real-time availability checks, dynamic cost calculations, customer approval stages, intelligent routing, and automated correspondence notifications.

### 📑 Project Documents & Specifications
* 📄 [Pega Blueprint - Movie Ticket Booking (BP-2415612)](./Pega%20Blueprint%20-%20Movie%20Ticket%20Booking.pdf)
* 📄 [National Internship Program Project User Stories & Specifications](./Movie_Ticket_Booking_NIP.pdf)

---

## 🎯 Key Objectives

* **Automated Case Lifecycle:** Streamlined case progression from ticket request submission to ticket confirmation and resolution.
* **Reusable Data Modeling:** Centralized data structures for Movies, Shows, Bookings, Seats, Customers, and Notifications.
* **Dynamic Business Rules & Pricing:** Automated seat availability checks and real-time total cost calculation based on ticket pricing and quantity.
* **Customer Verification & Approvals:** User review stages to confirm booking details prior to payment/execution.
* **Intelligent Routing:** Automated work routing based on show type (`PremiumShowQueue` vs `StandardShowQueue`).
* **SLA & Escalation Management:** Enforce response times with automated goal/deadline urgency escalation.
* **Automated Correspondence:** Instant customer email confirmations upon successful booking resolution.

---

## 🏛️ Application Architecture & Blueprint

### 👥 Personas & Channels (6)
1. **Customer:** Submits ticket requests, selects movie/timing/seats, and reviews/approves booking details.
2. **Booking Agent:** Verifies seating availability and assists in booking fulfillment.
3. **Support Team:** Handles customer inquiries and exceptions.
4. **Premium Show Team:** Manages premium / special screening booking queues (`PremiumShowQueue`).
5. **Standard Show Team:** Manages standard theatre screening booking queues (`StandardShowQueue`).
6. **Application Control Agent:** Oversees background automation, SLA tracking, and correspondence.

### 🗄️ Data Objects (6)
| Data Object | System of Record | Description / Key Properties |
| :--- | :--- | :--- |
| **`Customer`** | Pega (Local) | Customer Name, Email, Phone Number, Customer ID |
| **`Movie`** | Pega (Local) | Movie ID, Movie Name, Genre, Duration, Rating, Language |
| **`Show`** | Pega (Local) | Show ID, Movie ID, Show Date, Show Time, Show Type (Premium/Standard), Seat Capacity |
| **`Booking`** | Pega (Local) | Booking ID, Case ID, Customer ID, Show ID, Number of Tickets, Total Cost, Booking Status |
| **`Seat`** | Pega (Local) | Seat ID, Show ID, Seat Numbers, Seat Type, Availability Status |
| **`Notification`**| Pega (Local) | Notification ID, Case ID, Recipient, Message Subject, Body, Sent Timestamp |

---

## 🔄 Case Lifecycle & Workflow (`Movie Ticket Request`)

```text
[ Stage 1: Request Capture ]
   └─ Step: Capture Movie, Date, Time & Number of Tickets (Customer)
          ↓
[ Stage 2: Availability & Costing ]
   ├─ Step: Verify Seat Availability & Capacity (Booking Agent / System)
   └─ Step: Calculate Total Cost (Ticket Price × Quantity)
          ↓
[ Stage 3: Customer Approval / Confirmation ]
   └─ Step: Review Booking Details & Confirm / Cancel Decision (Customer)
          ↓
[ Stage 4: Booking Execution & Routing ]
   ├─ Step: Route by Show Type (PremiumShowQueue vs StandardShowQueue)
   └─ Step: Allocate Seat Numbers & Generate Ticket ID
          ↓
[ Stage 5: Resolution & Notification ]
   └─ Step: Automated Email Correspondence to Customer upon Resolution
```

---

## 📋 User Stories & Implementation Mapping

| Story ID | Title | Summary & Implementation Details |
| :--- | :--- | :--- |
| **US-001** | **Submit Movie Ticket Request** | Customer initiates `Movie Ticket Request` case. Inputs: Movie Name, Show Date, Show Time, Number of Tickets. Validated before submission and associated with reusable Movie & Show data objects. |
| **US-002** | **Check Show Availability** | Availability stage step verifies if requested show has seats. Captures `Seat Availability Status` and `Available Seats Count` with strict validation. |
| **US-003** | **Calculate Booking Cost** | Computes `Total Cost` through business rules using `Ticket Price` × `Number of Tickets`. Stored dynamically within the case. |
| **US-004** | **Confirm Booking Request** | Customer approval step captures customer confirmation decision (`Booking Status`). Confirmed requests proceed; cancelled requests are resolved. |
| **US-005** | **Maintain Movie and Show Data** | Reusable `Movie` and `Show` data objects maintained independently for consistency across cases (Name, Genre, Date, Time, Seat Capacity). |
| **US-006** | **Review Booking Details** | Structured UI presents Movie Name, Show Timing, Number of Tickets, and Total Cost to customer before final confirmation. |
| **US-007** | **Process Ticket Booking** | Execution stage handles final booking: allocates seat numbers, assigns `Ticket ID`, and updates `Booking Confirmation Status`. |
| **US-008** | **Notify Booking Confirmation** | Automated correspondence rule triggered upon case resolution sending booking summary to customer. |
| **US-009** | **Define Booking SLA** | SLA configured on case type: **Goal = 1 day**, **Deadline = 2 days**. Missing deadline automatically increases case urgency. |
| **US-010** | **Route Request by Show Type** | Automatically routes case via When rule/Decision Table to `PremiumShowQueue` or `StandardShowQueue` based on `Show Type`. |

---

## ✉️ Correspondence Template (Email Notification)

Upon successful resolution of the booking request, the following notification is dispatched:

```text
Subject: Movie Ticket Booking Confirmed – [Case ID]

Dear [Customer Name],

Your movie ticket booking has been successfully confirmed.
Below are the details of your booking:
• Case ID: [Case ID]
• Movie Name: [Movie Name]
• Show Date & Time: [Show Date & Time]
• Number of Tickets: [Number of Tickets]
• Seat Numbers: [Seat Numbers]
• Total Cost: [Total Cost]

Please arrive at the theatre before show time and present your booking details at entry.

Thank you for choosing our services. Enjoy your movie!

Regards,
CineWave Entertainment – Booking Support Team
```

---

## 🛠️ Technology Stack

* **Platform:** Pega Platform™ 24.x / Infinity
* **Scaffolding:** Pega GenAI Blueprint™
* **Architecture:** Pega Case Management, Data Pages, Decision Rules (When/Decision Tables), SLAs, Work Queues & Routing, Correspondence Rules
* **UI/UX:** Pega Constellation / Theme Cosmos Design System

---

## 👨‍💻 Author & Repository

* **Author:** Sanjay S ([@Sanjay8555](https://github.com/Sanjay8555))
* **Repository:** [Movie_Ticket_Booking](https://github.com/Sanjay8555/Movie_Ticket_Booking)

---

⭐ **Movie Ticket Booking Management Application · CineWave Entertainment · Built with Pega Platform™**
