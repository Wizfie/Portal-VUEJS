import Swal from "sweetalert2";
import { ref } from "vue";
import axios from "axios";

const isLoading = ref(false);
const adminEmail = ref();
const ccEmail = ref([]);

const validateNip = (nip) => {
  const nipPattern = /^\d{2}-\d{4}$/; // Format 23-1234
  return nipPattern.test(nip);
};

const getEmailCc = async (role, department) => {
  try {
    const res = await axios.get("/auth/emails", {
      params: {
        role: role,
        department: department,
      },
    });
    const data = await res.data;
    ccEmail.value = data.map((item) => item.email);
  } catch (error) {
    console.error("FAIL GET CC " + error.message);
  }
};

const getEmailAdmin = async () => {
  try {
    const response = await axios.get("/auth/emails", {
      params: {
        role: "ADMIN",
      },
    });
    const data = response.data;
    adminEmail.value = data.map((item) => item.email);
    // console.log(adminEmail.value);
  } catch (error) {
    console.error("Fail get email Admin " + error);
  }
};
const emailReject = async (file, user, reasons) => {
  await getEmailAdmin();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fileName = file;
  const username = user;
  const reason = reasons;

  // Susun email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h3 {
          color: #2a5d9f;
        }
      </style>
    </head>
    <body>
      <H3>Hi Team ${username},</H3>
    <p>Mohon maaf ya File kamu yang terkait kegiatan Continuous Improvement (QCC & Suggestion System) sayangnya belum bisa disetujui.</p>
    <p>Detail:</p>
    <ul>
      <li><strong>Nama File:</strong> ${fileName}</li>
      <li><strong>Tanggal Peninjauan :</strong> ${currentDate}</li>
    </ul>

    <p>Alasan penolakan:</p>
    </br>
    <p>${reason}</p>

    <p>Mungkin bisa dicoba revisi lagi sesuai masukan yang ada, terus upload ulang ya. Jangan patah semangat, kita yakin kamu bisa kok! Kalau butuh bantuan atau penjelasan lebih lanjut, jangan ragu untuk hubungi kami di <a href=mailto:${adminEmail.value}> [Kontak Kami] </a> , ya!
    </p>
    <p>Terima kasih banyak sudah mau berusaha, ya!</p>
    <p>Salam hangat,</p>
    <p>Komite Continuous Improvement Logistic</p>
    </body>
    </html>
  `;
};

const emailUploadFile = async (files, user) => {
  await getEmailAdmin();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const username = user;
  const fileList = Array.isArray(files)
    ? files.map((file) => `<li>${file}</li>`).join("")
    : `<li>${files}</li>`;

  // Susun email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h3 {
          color: #2a5d9f;
        }
      </style>
    </head>
    <body>
      <H3>Hi Team ${username},</H3>
    <p>Kami dengan senang hati menginformasikan bahwa file Anda terkait kegiatan Continuous Improvement (QCC & Suggestion System) telah berhasil ter Upload.</p>
    <p>Detail:</p>
    <ul>
      <strong>Nama File:</strong>
      ${fileList}
      <li><strong>Tanggal Upload :</strong> ${currentDate}</li>
    </ul>
    <p>Terima kasih atas kontribusi berharga Anda dalam kegiatan Continuous Improvement ini. Kami sangat mengapresiasi dedikasi Anda dalam mendukung upaya peningkatan berkelanjutan ini.
    </p>
    <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di <a href=mailto:${adminEmail.value}> [Kontak Kami] </a></p>
    <p>Salam hangat,</p>
    <p>Komite Continuous Improvement Logistic</p>
    </body>
    </html>
  `;
};
const emailApproval = async (file, user) => {
  await getEmailAdmin();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fileName = file;
  const username = user;

  // Susun email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h3 {
          color: #2a5d9f;
        }
      </style>
    </head>
    <body>
      <H3>Hi Team ${username},</H3>
    <p>Kami dengan senang hati menginformasikan bahwa file Anda terkait kegiatan Continuous Improvement (QCC & Suggestion System) telah disetujui.</p>
    <p>Detail:</p>
    <ul>
      <li><strong>Nama File:</strong> ${fileName}</li>
      <li><strong>Tanggal Disetujui :</strong> ${currentDate}</li>
    </ul>
    <p>Terima kasih atas kontribusi berharga Anda dalam kegiatan Continuous Improvement ini. Kami sangat mengapresiasi dedikasi Anda dalam mendukung upaya peningkatan berkelanjutan ini.
    </p>
    <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di <a href=mailto:${adminEmail.value}> [Kontak Kami] </a></p>
    <p>Salam hangat,</p>
    <p>Komite Continuous Improvement Logistic</p>
    </body>
    </html>
  `;
};

const emailRegistration = async (selectedTeam, selectedEvent, user) => {
  await getEmailAdmin();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const teamName = selectedTeam.value.teamName;
  const event = selectedEvent.value.eventName;
  const username = user.value.username;

  // Susun email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h3 {
          color: #2a5d9f;
        }
      </style>
    </head>
    <body>
      <H3>Hi ${username},</H3>
    <p>Selamat! Pendaftaran Anda untuk event Continuous Improvement (QCC & Suggestion System) telah berhasil.</p>
    <p>Detail:</p>
    <ul>
      <li><strong>Nama Team:</strong> ${teamName}</li>
      <li><strong>Nama Event:</strong> ${event}</li>
      <li><strong>Tanggal:</strong> ${currentDate}</li>
    </ul>
    <p>Kami sangat senang rekan-rekan dapat bergabung bersama kami. Jangan lupa untuk membawa antusiasme dan semangat ber-improvement selalu yaa! Jika memiliki pertanyaan atau memerlukan informasi lebih lanjut, silakan hubungi kami di <a href=mailto:${adminEmail.value}> [Kontak Kami] </a>.</p>
    <p>Sampai jumpa di Continuous Improvement (QCC & Suggestion System)!</p>
    <p>Salam hangat,</p>
    <p>Komite Continuous Improvement Logistic</p>
    </body>
    </html>
  `;
};

const websiteURL = `${import.meta.env.VITE_WEB_URL}`;
const emailEvent = async (eventData) => {
  const steps = eventData.steps;

  await getEmailAdmin();

  // Cari tanggal paling awal dan paling akhir
  const earliestStartDate = steps.reduce((earliest, step) => {
    return earliest < step.startDate ? earliest : step.startDate;
  }, steps[0].startDate);

  const latestEndDate = steps.reduce((latest, step) => {
    return latest > step.endDate ? latest : step.endDate;
  }, steps[0].endDate);

  // Susun email HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        h3 {
          color: #2a5d9f;
        }
      </style>
    </head>
    <body>
      <h3>Dear All,</h3>
      <p>Komite Continuous Improvement dengan penuh antusias mengundang Anda untuk berpartisipasi dalam 
      <b>${eventData.event.eventName} (${eventData.event.eventType})</b>. Program ini dirancang untuk mendukung peningkatan kualitas dan efisiensi di lingkungan kerja kita.</p>

      <h4>✨ Detail Program:</h4>
      <ul>
        <li><b>Periode Program:</b> ${earliestStartDate} – ${latestEndDate}</li>
        <li><b>Deskripsi:</b> Program ini melibatkan kolaborasi, inovasi, dan peningkatan berkelanjutan di lingkungan kerja.</li>
      </ul>

      <p><b>Keuntungan Berpartisipasi:</b></p>
      <ul>
        <li>Bimbingan dari mentor dan praktisi ahli</li>
        <li>Pengembangan keterampilan inovatif</li>
        <li>Kesempatan kolaborasi lintas tim</li>
        <li>Pengakuan dan apresiasi khusus</li>
      </ul>

      <b>Cara Pendaftaran:</b>

      <p>Klik link berikut untuk mendaftar pada program QCC dan/atau Suggestion System: <a href="${websiteURL}"> Website</a></p>

      <p>Dengan berpartisipasi, Anda akan menjadi bagian dari perubahan nyata menuju peningkatan kualitas yang berkelanjutan. Mari bersama-sama membawa inovasi dan transformasi di setiap aspek pekerjaan kita!</p>

      <p>Jika Anda memiliki pertanyaan lebih lanjut, hubungi kami di 
      <a href=mailto:${adminEmail.value}> [Kontak Kami] </a>.</p>

      <p>Salam hangat,<br>Komite Continuous Improvement</p>
    </body>
    </html>
  `;
};

const sendEmail = async (mailRequest) => {
  try {
    await axios.post("/email/send", mailRequest);

    console.info("Email Send");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const handleSearch = async (searchQuery, fetchFunction) => {
  if (searchQuery.length >= 3 || searchQuery.length === 0) {
    await fetchFunction();
  }
};

const changePage = async (newPage, fetchFunction, totalPages) => {
  // Validasi agar tidak keluar dari batas halaman
  if (newPage < 1 || newPage > totalPages) return;

  // Lakukan pemanggilan fungsi fetch untuk memuat data pada halaman baru
  await fetchFunction(newPage);
};

const calculatePageNumbers = (currentPage, totalPages) => {
  const maxPages = 10;
  const halfMax = Math.floor(maxPages / 2);

  let start = Math.max(1, currentPage - halfMax);
  let end = Math.min(totalPages, start + maxPages - 1);

  if (end === totalPages) start = Math.max(1, end - maxPages + 1);
  if (start === 1) end = Math.min(totalPages, start + maxPages - 1);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
const holdPage = (currentPageRef) => {
  const savedPage = localStorage.getItem("currentPage");
  if (savedPage) {
    currentPageRef.value = parseInt(savedPage);
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVE":
      return "bg-green-400 p-1 rounded-md ";
    case "REJECT":
      return "bg-red-400 p-1 rounded-md";
    case "PENDING":
      return "bg-yellow-200 p-1 rounded-md ";
    default:
      return "";
  }
};

const handleConfirm = async ({
  title = "Are you sure?",
  text = "This action cannot be undone?",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
    cancelButtonText: "No, cancel!",
  });
  return result.isConfirmed;
};

const isSidebarOpen = ref(false);

const sidebarToggle = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  // console.log("Sidebar toggled:", isSidebarOpen.value);
};

const handleAlert = (icon, ...args) => {
  let title = "";
  let text = "";
  let html = "";

  if (args.length >= 1) {
    title = args[0];
  }
  if (args.length >= 2) {
    text = args[1];
  }
  if (args.length >= 3) {
    html = args[2];
  }

  Swal.fire({
    position: "center",
    icon,
    title,
    text,
    html,
    showConfirmButton: true,
  });
};

const handleError = (...args) => {
  handleAlert("error", ...args);
};

const handleInfo = (...args) => {
  handleAlert("info", ...args);
};

const handleSuccess = (...args) => {
  handleAlert("success", ...args);
};

const withLoading = async (asyncFunc) => {
  isLoading.value = true;
  try {
    await asyncFunc();
  } catch (error) {
    console.log(error.message || "An error occurred");
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const downloadFile = (fileName) => {
  withLoading(async () => {
    axios({
      url: `/file/${fileName}`,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
        handleError("File tidak tersedia", "Tidak ada file untuk diunduh");
      });
  });
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options); // Ganti 'id-ID' dengan locale yang sesuai
};
const formatYear = (dateString) => {
  const options = { year: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options); // Ganti 'id-ID' dengan locale yang sesuai
};

const formatScore = (score) => {
  return score !== null ? parseFloat(score).toFixed(2) : "N/A";
};

export {
  validateNip,
  handleSearch,
  changePage,
  calculatePageNumbers,
  holdPage,
  getStatusColor,
  handleError,
  handleInfo,
  handleSuccess,
  withLoading,
  handleConfirm,
  formatDate,
  isLoading,
  downloadFile,
  formatScore,
  formatYear,
  truncateText,
  isSidebarOpen,
  sidebarToggle,
  sendEmail,
  emailEvent,
  emailRegistration,
  emailApproval,
  emailReject,
  getEmailAdmin,
  getEmailCc,
  ccEmail,
  emailUploadFile,
};
