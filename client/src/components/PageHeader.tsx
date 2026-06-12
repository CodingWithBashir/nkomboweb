interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && <p className="text-xl text-gray-200">{description}</p>}
      </div>
    </div>
  );
}
