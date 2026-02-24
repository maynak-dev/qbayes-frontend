import TotalUsersCard from './TotalUsersCard';
import TrafficSourcesCard from './TrafficSourcesCard';
import NewUserCard from './NewUserCard';
import SalesDistributionCard from './SalesDistributionCard';
import ProjectProgressCard from './ProjectProgressCard';
import ActiveAuthorsCard from './ActiveAuthorsCard';
import NewDesignationsCard from './NewDesignationsCard';
import UserActivityCard from './UserActivityCard';

const Dashboard = () => {
  return (
    <div className="fade-in">
      <div className="dashboard-grid">
        <TotalUsersCard />
        <TrafficSourcesCard />
        <NewUserCard />
        <SalesDistributionCard />
        <ProjectProgressCard />
        <ActiveAuthorsCard />
        <NewDesignationsCard />
        <UserActivityCard />
      </div>
    </div>
  );
};

export default Dashboard;