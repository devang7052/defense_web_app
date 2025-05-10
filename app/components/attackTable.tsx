import { AttackInfo } from "../lib/conflictData";

interface AttacksTableProps {
  attacks: AttackInfo[];
}

export default function AttacksTable({ attacks }: AttacksTableProps) {
  // Format the timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attacks.map((attack, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{attack.city}</div>
                <div className="text-sm text-gray-500">{attack.state}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatTimestamp(attack.timestamp)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {attack.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}