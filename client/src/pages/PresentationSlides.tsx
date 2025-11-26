export default function PresentationSlides() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/presentation.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Presentation Slides"
      />
    </div>
  );
}
