"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export function ContactLocationMap({
  longitude,
  latitude,
  className = "h-full w-full",
}: {
  longitude: number;
  latitude: number;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fungsi inisialisasi peta
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const location = { lat: latitude, lng: longitude };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
      });

      const contentString = `
        <div style="font-family: Arial, sans-serif; padding: 5px; max-width: 200px;">
            <h3 style="margin: 0 0 5px 0; color: #1a73e8; font-size: 16px;">Prime Property</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #5f6368;">
                Ini adalah lokasi kantor kami. Anda bisa mengunjungi kami untuk konsultasi.
            </p>
            <button onclick="window.open('https://wa.me/6281112345678', '_blank')" style="background-color: #1a73e8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                Hubungi Kami
            </button>
        </div>
      `;

      const infowindow = new window.google.maps.InfoWindow({
        content: contentString,
        ariaLabel: "Prime Property",
      });

      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: "Klik untuk melihat detail",
      });

      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
        });
      });
    };

    // Load Google Maps script jika belum ada
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const existingScript = document.getElementById("google-maps-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCeyP_0nYynBU5ImC0AWBzGxkiXep-Z0K4";
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initMap);
      }
    }
  }, [latitude, longitude]);

  return <div ref={mapRef} className={className} />;
}
