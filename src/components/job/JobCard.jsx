import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import { Link } from 'react-router-dom'

function statusBadge(status) {
  if (status === 'proposed') return <Badge className="bg-border text-text">Proposed</Badge>
  if (status === 'funded') return <Badge variant="info">Funded</Badge>
  if (status === 'in_progress') return <Badge variant="warning">In Progress</Badge>
  if (status === 'partial_completed') return <Badge className="bg-primary text-white">Partial Completed</Badge>
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  if (status === 'disputed') return <Badge variant="danger">Disputed</Badge>
  return <Badge className="bg-border text-text">{status}</Badge>
}

export default function JobCard({ job }) {
  const sellerName = job.seller?.name || 'Seller'
  const sellerAvatar = job.seller?.avatar || null
  const sellerCategory = job.seller?.sellerProfile?.category || 'General'
  const amount = job.agreedAmount || 0

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={sellerName} src={sellerAvatar} size={40} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{job.title}</div>
            {statusBadge(job.status)}
          </div>
          <div className="text-sm mt-1 line-clamp-2">{job.description}</div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="font-medium">{sellerName}</span>
            <span className="text-text/70">• {sellerCategory}</span>
            <span className="text-text/70">• ₦{Number(amount).toLocaleString('en-NG')}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-text/70">{new Date(job.createdAt).toLocaleDateString()}</div>
            <Link to={`/jobs/${job.id}`}>
              <Button variant="outline">View Details</Button>
            </Link>
          </div>
          <div className="flex items-center justify-end mt-2">
            {job.status === 'proposed' ? (
              <Link to={`/payment/${job.id}`}>
                <Button variant="primary">Pay Deposit</Button>
              </Link>
            ) : (
              <Link to={`/jobs/${job.id}`}>
                <Button variant="secondary">Open</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
