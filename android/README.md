# CareConnect Clinic - Native Android Java Application

A HIPAA-compliant clinical healthcare application built in Java for Android Studio.

## 🚀 How to Open in Android Studio

1. Launch **Android Studio** (Hedgehog, Iguana, Jellyfish, or newer).
2. Click **File -> Open...** (or **Open** from the Welcome screen).
3. Navigate to and select this **`android`** folder (the directory containing `settings.gradle` and `app/`).
4. Android Studio will automatically sync the Gradle project (`Gradle 8.6`, `Android Gradle Plugin 8.4.0`, `Java 17`, `compileSdk 34`).
5. Choose an Android Emulator (e.g. Pixel 8 or Pixel 9 Pro with API 34) or a connected physical Android device.
6. Click **Run ('app')** (or press `Shift + F10`).

---

## 🏥 Architecture & Key Features

### 1. Registration & Authentication (`AuthActivity.java`)
- **Patient Registration**: Enrolls new patients with First/Last Name, DOB, Blood Type, Phone Number (for SMS reminders), and automated Medical Record Number (MRN) generation (`MRN-XXXXXX`).
- **HIPAA Privacy Notice**: Mandatory acknowledgement of Notice of Privacy Practices (45 CFR § 164.520).
- **1-Tap Role Presets**: Instant access buttons for quick testing:
  - **Patient**: Maya Lin (`MRN-882194`)
  - **Doctor**: Dr. Elena Vance, MD (`Internal Medicine`)
  - **Admin**: David Sterling (`Clinical Operations`)

### 2. Patient Portal & Reminders (`PatientPortalFragment.java`)
- **Active Reminder Banner**: Displays upcoming visit countdown, fasting instructions, and an interactive **"Confirm Attendance"** action that updates clinic status and sends SMS/email reminders.
- **Health Vitals Card**: Real-time display of Blood Pressure, Heart Rate, and Blood Type.
- **Secure Appointment Scheduling**: Tap **"+ Book Visit"** to open a modal dialog with doctor selection, date/slot choice (Morning, Afternoon, Evening), visit modality (In-Person vs. Secure Telehealth), and clinical reason.

### 3. Patient Records & EHR (`MedicalRecordsFragment.java`)
- Comprehensive clinical history: SOAP notes (Subjective, Objective, Assessment, Plan), ICD-10 diagnoses, vital sign trends, and active prescriptions.
- **Search & Filter**: Real-time query across diagnoses, clinical notes, and physician names.
- **Emergency "Break-Glass" Access**: Authorized clinicians can trigger emergency override per 45 CFR § 164.312(a)(2)(ii) with mandatory justification logging.

### 4. Clinic Flow & Doctor Availability (`AdminDashboardFragment.java`)
- **Real-Time Patient Tracker**: Live visual board tracking patients across clinic stages:
  - `WAITING` -> `IN_TRIAGE` -> `WITH_DOCTOR` -> `LAB_IMAGING` -> `DISCHARGED`
  - Tap any patient card to advance their clinical workflow stage.
- **Doctor Availability Dashboard**: Live physician roster with toggleable statuses (`AVAILABLE`, `IN_CONSULTATION`, `ON_BREAK`, `OFF_DUTY`), room assignments, and active patient queue counters.

### 5. Encrypted Consultations (`EncryptedChatFragment.java`)
- End-to-End Encrypted clinical messaging between medical staff and patients.
- Uses **AES-256 GCM** authenticated encryption with unique initialization vectors (IV).

### 6. HIPAA Security Rule § 164.312 Center (`HipaaComplianceFragment.java`)
- **Technical Safeguards**:
  - § 164.312(a)(1) Role-Based Access Control (RBAC)
  - § 164.312(a)(2)(iv) AES-256 GCM Authenticated Encryption
  - § 164.312(b) Immutable Cryptographic Audit Controls
  - § 164.312(a)(2)(ii) Emergency Break-Glass Override Enforced
- **Tamper-Proof Audit Trail**: Every authentication, PHI access, appointment creation, and break-glass override generates an audit entry stamped with a **SHA-256 verification checksum**.

### 7. PHI Privacy Shield & Session Auto-Lock
- **Privacy Shield Toggle**: Top-bar shield icon masks sensitive patient identifiers (`MRN-••••-••`, `M•••• L••••`) for viewing in public or non-clinical environments.
- **Session Auto-Lock**: Lock button and inactivity timer lock the screen, requiring user re-authentication.

---

## 📁 Source Code Structure

```
android/
├── build.gradle                        # Top-level Gradle configuration
├── settings.gradle                     # Project settings (includes :app)
├── gradle.properties                   # JVM args & AndroidX settings
├── gradle/wrapper/
│   └── gradle-wrapper.properties       # Gradle 8.6 wrapper
└── app/
    ├── build.gradle                    # App module dependencies (Material3, Security Crypto, Gson)
    └── src/main/
        ├── AndroidManifest.xml         # Manifest permissions, activities & theme
        ├── java/com/careconnect/clinic/
        │   ├── activities/
        │   │   ├── AuthActivity.java           # Login, registration & demo roles
        │   │   └── MainActivity.java           # Bottom navigation & session security
        │   ├── fragments/
        │   │   ├── PatientPortalFragment.java          # Reminders, vitals & booking
        │   │   ├── MedicalRecordsFragment.java         # EHR records & Break-Glass
        │   │   ├── AdminDashboardFragment.java         # Patient flow & Doctor status
        │   │   ├── EncryptedChatFragment.java          # AES-256 E2EE consultations
        │   │   └── HipaaComplianceFragment.java        # § 164.312 audit log stream
        │   ├── models/
        │   │   ├── User.java
        │   │   ├── Patient.java
        │   │   ├── Appointment.java
        │   │   ├── AppointmentReminder.java
        │   │   ├── MedicalRecord.java
        │   │   ├── DoctorAvailability.java
        │   │   ├── EncryptedMessage.java
        │   │   └── HipaaAuditLog.java
        │   ├── adapters/
        │   │   ├── AppointmentAdapter.java
        │   │   ├── MedicalRecordAdapter.java
        │   │   ├── ChatMessageAdapter.java
        │   │   ├── DoctorStatusAdapter.java
        │   │   ├── PatientFlowAdapter.java
        │   │   └── AuditLogAdapter.java
        │   ├── repository/
        │   │   └── ClinicRepository.java       # Singleton clinical data store
        │   └── security/
        │       ├── CryptoManager.java          # AES-256 GCM & SHA-256 hashing
        │       └── SessionManager.java         # HIPAA session & privacy shield
        └── res/
            ├── drawable/                       # Vector icons and card backgrounds
            ├── layout/                         # XML layouts for activities, fragments & dialogs
            ├── menu/                           # Bottom navigation items
            └── values/                         # Colors, strings, themes
```
