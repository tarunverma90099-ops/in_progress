// // Step 1: Import the necessary hooks from React and the scanner library
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { ArrowLeft } from 'lucide-react';

// export default function StudentVerificationPage() {
//   const navigate = useNavigate();
  
//   // Step 2: Set up state to hold the scanned data
//   const [scannedData, setScannedData] = useState(null);

//   useEffect(() => {
//     // This is the main logic for the scanner
    
//     // Success callback: This function runs ONLY when a QR code is successfully scanned
//     function onScanSuccess(decodedText, decodedResult) {
//       console.log(`Scan result: ${decodedText}`); // Log the result to see it working
      
//       setScannedData(decodedText); // Save the scanned data into our state
      
//       // We will add logic here later to move to the next step (location/face)
//       // For now, we just show the result.
      
//       // It's very important to stop the scanner after a success
//       html5QrcodeScanner.clear().catch(error => {
//         console.error("Failed to clear scanner.", error);
//       });
//     }

//     // Failure callback: This function can be used to handle errors (optional for now)
//     function onScanFailure(error) {
//       // You can ignore this for the demo, but it's good practice.
//       // console.warn(`Code scan error = ${error}`);
//     }

//     // Step 3: Create a new scanner instance
//     let html5QrcodeScanner = new Html5QrcodeScanner(
//       "qr-reader", // The ID of the div element where the scanner will appear
//       { fps: 10, qrbox: { width: 250, height: 250 } }, // Configuration
//       false // Verbose logging
//     );

//     // Step 4: Start the scanner
//     html5QrcodeScanner.render(onScanSuccess, onScanFailure);

//     // Step 5: Cleanup function - This is crucial!
//     // It stops the camera when the user navigates away from the page.
//     return () => {
//       html5QrcodeScanner.clear().catch(error => {
//         console.error("Failed to clear scanner on component unmount.", error);
//       });
//     };
//   }, []); // The empty array [] means this effect runs only once when the component loads

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 text-gray-300 hover:text-white mb-6"
//         >
//           <ArrowLeft size={20} /> Go Back to Dashboard
//         </button>
        
//         <div className="bg-gray-800 shadow-lg rounded-2xl p-8">
//           {!scannedData ? (
//             // If we haven't scanned anything yet, show the scanner
//             <div>
//               <h1 className="text-2xl font-bold mb-4 text-center">Scan QR Code</h1>
//               {/* Step 6: This is the div where the scanner will be rendered */}
//               <div id="qr-reader" className="w-full"></div>
//             </div>
//           ) : (
//             // If we HAVE scanned something, show the success message
//             <div className="text-center">
//                <h1 className="text-2xl font-bold mb-4 text-green-400">Scan Successful!</h1>
//                <p className="text-gray-300">The QR code contains the following data:</p>
//                <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left text-sm break-words">
//                   <code>{scannedData}</code>
//                </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

