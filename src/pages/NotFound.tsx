import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the missing route for debugging/analytics
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background/50 via-primary/5 to-accent/5 p-6">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-6xl font-extrabold text-foreground">404</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Sorry, we couldn't find the page you're looking for.
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                Tried URL: <span className="font-medium text-foreground">{location.pathname}</span>
              </p>

              <div className="mt-6">
                <Link to="/dashboard">
                  <Button className="min-w-[140px]">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
            {/* no decorative image */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
