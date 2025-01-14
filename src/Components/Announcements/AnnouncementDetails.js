import React, { useState, useEffect, useContext } from "react";
import logo from "../Assets/logo.png";
import { Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GlobalContext } from "../../GlobalContext";

import styles from "./AnnouncementDetails.module.css";

const AnnouncementDetails = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const { id } = useParams();
    const location = useLocation();
    const announcement = location.state;
    const [adDetails, setAdDetails] = useState(null);
    const [ownerDetails, setOwnerDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Pobieranie szczegółów ogłoszenia
                const { data: adData, error: adError } = await supabase
                    .from("announcement")
                    .select("*")
                    .eq("announcement_id", id)
                    .single();

                if (adError) throw adError;

                setAdDetails(adData);

                // Pobieranie szczegółów właściciela ogłoszenia
                const { data: userData, error: userError } = await supabase
                    .from("users_details")
                    .select("name, surname")
                    .eq("user_id", adData.owner_id)
                    .single();

                if (userError) throw userError;

                setOwnerDetails(userData);
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
            setLoading(false);
        };

        fetchDetails();
    }, [id, supabase]);

    if (loading) {
        return <p>Ładowanie szczegółów ogłoszenia...</p>;
    }

    if (!adDetails) {
        return <p>Nie znaleziono ogłoszenia</p>;
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div className={styles.headerButtons}>
                    <Button onClick={() => navigate("/profile")} variant="primary">
                        Twój profil
                    </Button>
                    <Button onClick={() => navigate("/announcements")} variant="info">
                        Twoje ogłoszenia
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.adContainer}>
                    <div className={styles.adImage}>
                        <img
                            src={announcement?.imageUrl || "default_image_url.png"}
                            alt={announcement?.name || "Zdjęcie ogłoszenia"}
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.adDetails}>
                        <h1 className={styles.adTitle}>{announcement?.name || "Ogłoszenie"}</h1>
                        <p className={styles.adDescription}>
                            <strong>Opis:</strong> {announcement?.text || "Brak opisu"}
                        </p>
                        <p>
                            <strong>Dodano:</strong>{" "}
                            {adDetails?.added_at
                                ? new Date(adDetails.added_at).toLocaleDateString()
                                : "Brak danych"}
                        </p>
                        <p>
                            <strong>Lokalizacja:</strong> {announcement?.location || "Brak danych"}
                        </p>
                        <p>
                            <strong>Typ ogłoszenia:</strong>{" "}
                            {announcement?.announcement_type === "offering_services"
                                ? "Usługi"
                                : "Poszukiwany opiekun"}
                        </p>
                        <p>
                            <strong>Właściciel ogłoszenia:</strong>{" "}
                            {ownerDetails
                                ? `${ownerDetails.name} ${ownerDetails.surname}`
                                : "Brak danych"}
                        </p>
                    </div>
                    <div className={styles.adButtons}>
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline-secondary"
                        >
                            Powrót do ogłoszeń
                        </Button>
                    </div>
                </div>
            </div>
            <footer className={styles.footer}>
                <p>© Amelia</p>
            </footer>
        </div>
    );
};

export default AnnouncementDetails;
