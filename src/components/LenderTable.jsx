import lenders from "../data/lenders";
import "./LenderTable.css";

export default function LenderTable() {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Lender</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {lenders.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}