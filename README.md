# MEMOSYS - Memory Management Simulator System

MEMOSYS adalah aplikasi dashboard simulasi berbasis web yang dirancang untuk memvisualisasikan cara kerja manajemen memori pada Sistem Operasi, khususnya teknik paging dan mekanisme Page Fault. 

Sistem ini dikembangkan untuk mengubah konsep abstrak sistem operasi menjadi representasi visual yang interaktif, memungkinkan pengguna untuk mengalokasikan memori, memantau tabel translasi, dan mengamati kondisi sistem saat memori fisik penuh (Overload).

## Tech Stack
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Deployment:** Vercel (Serverless Functions)

## Struktur Direktori
* `/api` - Berisi logika backend dan endpoint REST API (Serverless setup).
* `/models` - Berisi skema database Mongoose (State RAM & Activity Logs).
* `/public` - Berisi aset statis antarmuka pengguna (HTML, JS murni).

## Instalasi Lokal
1. Clone repositori ini: `git clone https://github.com/USERNAME_KAMU/memosys.git`
2. Masuk ke direktori proyek: `cd memosys`
3. Install dependensi: `npm install`
4. Buat file `.env` di root direktori dan tambahkan koneksi database: `MONGODB_URI=mongodb+srv://...`
5. Jalankan server lokal menggunakan Vercel CLI: `vercel dev`
6. Akses aplikasi melalui `http://localhost:3000`

## Tim Pengembang (Kelompok 6)
Proyek ini dikembangkan oleh mahasiswa Sistem dan Teknologi Informasi, Universitas Negeri Jakarta:
1. Kevin Christman Lumban Tobing (1519625025) - Project Initialization & Deployment
2. Kevindra Raditya Luthfiansyah (1519625004) - Backend Infrastructure
3. Natasya Nur Afriyani (1519625022) - Database Architect
4. Muhammad Zulhaydar Omar Rafiq (1519625046) - API Developer (Memory Setup)
5. Riyadh Fadillah (1519625030) - API Developer (Allocation & Page Fault)
6. Audlia Aska Widiaputri (1519625036) - API Developer (Deallocation & State)
7. Zaidan Alfaiz Sofyan (1519625047) - UI Engineer (Base & Navigation)
8. Kumara Tsany Widaydana (1519625034) - UI Engineer (Grid & Layouting)
9. Keymal Alghifary (1519625044) - Frontend Logic & DOM Manipulation