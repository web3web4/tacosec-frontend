const RenderContent = ({ htmlContent }: { htmlContent: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default RenderContent;