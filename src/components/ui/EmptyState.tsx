export default function EmptyState({ message }) {
    return (
        <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-500">{message}</h3>
        </div>
    );
}