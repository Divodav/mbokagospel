export const shareSong = async (song: any) => {
  const shareData = {
    title: song.title,
    text: `Écoutez "${song.title}" de ${song.artist_name || song.artist} sur Mboka Gospel !`,
    url: window.location.origin + `?song=${song.id}`,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copier dans le presse-papier
      await navigator.clipboard.writeText(shareData.url);
      alert("Lien copié dans le presse-papier !");
    }
  } catch (err) {
    console.error("Erreur de partage:", err);
  }
};